# TaskFlow Server

Backend API for the TaskFlow project management application. The server is a TypeScript Express API backed by MongoDB through Mongoose, with optional Upstash Redis caching and SMTP email delivery for verification and password reset flows.

## Documentation

- [API Reference](docs/API.md): route groups, authentication requirements, request bodies, response notes, and common errors.
- [Database Reference](docs/DATABASE.md): collections, relationships, indexes, lifecycle rules, and data invariants.
- [Architecture Reference](docs/ARCHITECTURE.md): runtime entrypoints, request flow, middleware, auth, cache, email, deployment notes, and known constraints.

## Runtime

The server has two runtime entrypoints:

- `src/server.ts`: local or long-running Node process. Loads environment variables, connects to MongoDB, initializes Redis, then starts Express.
- `api/index.ts`: Vercel serverless handler. Connects to MongoDB, then forwards the request to the Express app.

The Express app itself is defined in `src/app.ts` and mounts all API routes under `/api`.

## Scripts

```bash
npm run dev
npm run build
npm start
npm test
```

## Required Environment

Use `.env.example` as the template. Do not commit real `.env` files.

Core variables:

- `PORT`: local server port.
- `NODE_ENV`: runtime environment.
- `DB_URI`: MongoDB connection string.
- `JWT_SECRET`: signing secret for bearer tokens.
- `JWT_EXPIRES_IN`: token lifetime.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`: SMTP settings.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: optional Redis cache settings.
- `REDIS_TTL_BOARD`, `REDIS_TTL_PROJECT`, `REDIS_TTL_PROJECT_LIST`, `REDIS_TTL_TASKS`: optional cache TTL overrides.
- `RESET_TOKEN_EXPIRE`: password reset and email verification token lifetime in milliseconds.

## Authentication

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

JWT payloads contain the authenticated user id as `id`. Route handlers access it through `req.user.id` after `authMiddleware` verifies the token.

## Route Groups

Base URL: `/api`

- `/auth`: registration, login, email verification, password reset, current user.
- `/projects`: project list/detail/board/dashboard and project CRUD.
- `/tasks`: task list/detail/create/update/status/delete.
- `/columns`: board drag-and-drop task movement.
- `/users`: profile, password, notification preferences, and user stats.

See [docs/API.md](docs/API.md) for endpoint-level details.

## Development Notes

- Request validation uses Zod schemas beside each route group.
- Password hashing is handled by the `User` model pre-save hook.
- Project membership checks are centralized in `src/utils/access.util.ts`.
- Cache keys and invalidation helpers live in `src/config/redis.ts`.
- Existing tests use Jest with `ts-jest`.

## Known Constraints

- The Vercel handler currently connects to MongoDB per invocation path and does not initialize Redis directly.
- `Task` has a `dueDate` index and dashboard logic references task `dueDate`, but the task schema does not currently define a `dueDate` field.
- Some controller errors include `error.message` in responses, which is useful for development but should be tightened for production.
