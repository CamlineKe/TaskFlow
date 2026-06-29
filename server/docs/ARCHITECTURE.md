# Architecture Reference

## Overview

The server is a TypeScript Express API. It exposes project management endpoints for authentication, projects, boards, tasks, columns, and users.

Primary technologies:

- Express for HTTP routing.
- Mongoose for MongoDB models and queries.
- Zod for request validation.
- JSON Web Tokens for bearer authentication.
- bcryptjs for password hashing.
- Nodemailer for email verification and password reset emails.
- Upstash Redis for optional API response caching.
- Jest with `ts-jest` for tests.

## Directory Layout

```text
server/
  api/
    index.ts                  Vercel serverless entrypoint
  docs/
    API.md
    DATABASE.md
    ARCHITECTURE.md
  src/
    api/                      Route groups, controllers, validation
    config/                   Environment, MongoDB, Redis
    middleware/               Auth and validation middleware
    models/                   Mongoose models
    types/                    Local type declarations
    utils/                    Email and access helpers
    app.ts                    Express app composition
    server.ts                 Local/long-running server entrypoint
  README.md                   Server documentation index
```

## Runtime Entrypoints

### Local or Long-Running Node

Entrypoint: `src/server.ts`

Flow:

1. Load `.env` with `dotenv`.
2. Import the Express app from `src/app.ts`.
3. Connect to MongoDB with `connectDB()`.
4. Initialize Upstash Redis with `initializeRedis()`.
5. Start `app.listen(PORT)`.

Use:

```bash
npm run dev
```

or:

```bash
npm run build
npm start
```

### Vercel Serverless

Entrypoint: `api/index.ts`

Vercel routing is configured in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.ts"
    }
  ]
}
```

Flow:

1. Vercel invokes `api/index.ts`.
2. Handler calls `connectDB()`.
3. Handler forwards the request to the Express app.

Known constraint:

- The serverless handler currently does not call `initializeRedis()`, so Redis-backed cache helpers may behave as disabled in that path unless Redis is initialized elsewhere.
- `connectDB()` registers Mongoose connection listeners each time it is called. This should be made idempotent in a future runtime cleanup.

## Request Lifecycle

```text
HTTP request
  -> src/app.ts
  -> custom CORS middleware
  -> slow request timing middleware
  -> helmet
  -> express.json()
  -> / route health check or /api router
  -> route group
  -> authMiddleware when route is protected
  -> validate(schema) when route has a Zod schema
  -> controller
  -> Mongoose / Redis / email utility
  -> JSON response
```

## Middleware

### CORS

Defined in `src/app.ts`.

Current behavior:

- Allows hardcoded local and deployed origins.
- In development, allows the request origin or `*`.
- In production, falls back to the configured frontend origin.
- Handles `OPTIONS` preflight directly.
- Sends `Access-Control-Allow-Credentials: true`.

Known constraint:

- `.env.example` includes `ALLOWED_ORIGINS`, but the app currently uses hardcoded origins. Moving CORS origin configuration into `config.ts` would reduce deploy-time changes.

### Helmet

Configured after CORS in `src/app.ts`.

Notable settings:

- `crossOriginResourcePolicy: false`
- `crossOriginEmbedderPolicy: false`
- Basic CSP directives for self, inline styles, images, and known frontend/backend origins.

### Auth Middleware

Source: `src/middleware/auth.middleware.ts`

Protected routes require:

```http
Authorization: Bearer <jwt>
```

The middleware:

1. Reads the bearer token.
2. Verifies it with `JWT_SECRET`.
3. Attaches decoded payload to `req.user`.

Controllers assume `req.user.id` is the authenticated user id.

### Validation Middleware

Source: `src/middleware/validation.middleware.ts`

Each route group defines Zod schemas in `*.validation.ts`. The middleware validates:

- `body`
- `query`
- `params`

Validation errors return `400` with Zod error details.

## Route Organization

Root API router: `src/api/index.ts`

Mounted groups:

| Prefix | Module | Auth |
|---|---|---|
| `/api/auth` | `src/api/auth` | Mixed public/protected |
| `/api/projects` | `src/api/projects` | Protected |
| `/api/tasks` | `src/api/tasks` | Protected |
| `/api/columns` | `src/api/columns` | Protected |
| `/api/users` | `src/api/users` | Protected |

See [API.md](API.md) for endpoint details.

## Access Control

Source: `src/utils/access.util.ts`

Project access is based on:

- `Project.owner`
- `Project.members`

Helpers normalize ObjectId values across common Mongoose shapes:

- raw ObjectId
- string ObjectId
- populated document with `_id`

Rules:

- Project owners and members can read project data.
- Project owners can update and delete projects.
- Project owners and members can create, update, move, and delete tasks in the project.
- Column movement verifies the task project and both columns belong to the project board.

## Caching

Source: `src/config/redis.ts`

Redis is optional. If credentials are missing or operations fail, cache helpers return without breaking the request.

Cache helpers:

- `getCachedData`
- `setCachedData`
- `invalidateProjectCaches`

Cache keys:

- `project:board:<projectId>`
- `project:detail:<projectId>`
- `user:projects:<userId>`
- `user:tasks:<userId>`
- `dashboard:stats:<userId>`

Invalidation is explicit because Upstash REST does not support pattern deletion in this helper.

Operational note:

- Cache reads for protected project detail and board routes must happen after access checks. This is important because project cache keys are project-scoped rather than user-scoped.

## Email Flow

Source: `src/utils/email.util.ts`

The server sends:

- password reset codes
- email verification codes

Transport behavior:

1. If SMTP credentials are configured and not placeholders, create an SMTP transporter.
2. Verify the SMTP connection.
3. If SMTP verification fails, fall back to Ethereal test email.
4. In non-production, expose Nodemailer preview URLs when available.

Known constraint:

- A transporter is created and verified per send. Reusing a transporter would reduce latency.

## Registration Flows

### Legacy Registration

Route: `POST /api/auth/register`

Creates a user immediately and returns a JWT.

### Email Verification Registration

Preferred route family:

1. `POST /api/auth/register/initiate`
2. `POST /api/auth/register/verify-email`
3. `POST /api/auth/register/complete`

Compatibility aliases:

1. `POST /api/auth/initiate-registration`
2. `POST /api/auth/verify-registration-email`
3. `POST /api/auth/complete-registration`

Temporary registration data is stored in `EmailVerification` and removed after completion or TTL expiry.

## Password Reset Flow

Route family:

1. `POST /api/auth/password-reset/request`
2. `POST /api/auth/password-reset/verify`
3. `POST /api/auth/password-reset/reset`

Reset data is stored in `ResetToken` and removed by TTL expiry. Tokens are marked invalid after password reset.

## Board and Task Flow

Project creation creates:

1. Project document.
2. Board document.
3. Default columns: `To Do`, `In Progress`, `Done`.

Task creation:

1. Verifies the user can access the project.
2. Verifies the column belongs to the project board.
3. Derives task status from the column title.
4. Creates the task.
5. Pushes task id into `Column.tasks`.
6. Invalidates project participant caches.

Task movement:

1. Verifies the user can access the task project.
2. Verifies source column matches the task current column.
3. Verifies source and destination columns belong to the project board.
4. Reorders within one column or moves between columns.
5. Updates task status when moving across columns.
6. Invalidates project participant caches.

## Testing

Jest config: `jest.config.js`

Run:

```bash
npm test
```

Current coverage:

- `src/utils/access.util.test.ts` covers ObjectId normalization and project access helper behavior.

Recommended next tests:

- Auth middleware success/failure.
- Project read access for owner/member/non-member.
- Task create rejects columns outside the project board.
- Column move rejects cross-project moves.
- Cache invalidation is called for affected participants.

## Known Constraints And Follow-Ups

1. CORS origins are hardcoded despite `ALLOWED_ORIGINS` existing in `.env.example`.
2. `JWT_SECRET` has a fallback in `config.ts`; production should fail fast instead.
3. Vercel handler does not initialize Redis.
4. Mongo connection setup is not idempotent for serverless calls.
5. Task due-date behavior is inconsistent between schema, index, and dashboard code.
6. Multi-document writes are not transactional.
7. Many controllers return raw `error.message`; production error responses should be normalized.
