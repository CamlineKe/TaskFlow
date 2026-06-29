# TaskFlow

TaskFlow is a full-stack project and task management application with a Next.js client and a TypeScript Express API. This README is the main entry point for the repository. Use it to find the right app-level documentation quickly.

## Documentation

### Application Guides

- [Client README](client/README.md): frontend setup, runtime structure, workflows, environment variables, and links to detailed client docs.
- [Server README](server/README.md): backend setup, runtime entrypoints, environment variables, route groups, and links to detailed server docs.

### Client Docs

- [Client Architecture](client/docs/ARCHITECTURE.md): App Router structure, provider stack, auth boundary, theming, and runtime flow.
- [Client Routes](client/docs/ROUTES.md): public and protected routes, auth flows, project/task workflows, and board behavior.
- [Client API Integration](client/docs/API-INTEGRATION.md): axios setup, endpoint usage, auth headers, and security notes.
- [Client State and Data](client/docs/STATE-AND-DATA.md): Zustand, React Query, query keys, invalidation, forms, and browser storage.
- [Client Components](client/docs/COMPONENTS.md): layout, project, task, board, shared UI, and provider components.

### Server Docs

- [Server API Reference](server/docs/API.md): route groups, authentication requirements, request bodies, response notes, and common errors.
- [Server Database Reference](server/docs/DATABASE.md): collections, relationships, indexes, lifecycle rules, and data invariants.
- [Server Architecture Reference](server/docs/ARCHITECTURE.md): runtime entrypoints, request flow, middleware, auth, cache, email, deployment notes, and known constraints.

### Deployment

- [Deployment Notes](DEPLOYMENT.md): repository-level deployment guidance.

## Repository Structure

```text
TaskFlow/
+-- client/                 # Next.js frontend application
|   +-- README.md           # Client entry documentation
|   +-- docs/               # Client architecture, routes, API, state, and component docs
|   +-- app/                # Next.js App Router routes
|   +-- components/         # Reusable React components
|   +-- context/            # Theme context helpers
|   +-- lib/                # Providers, theme, and API client
|   +-- store/              # Zustand stores
+-- server/                 # TypeScript Express backend application
|   +-- README.md           # Server entry documentation
|   +-- docs/               # Server API, database, and architecture docs
|   +-- api/                # Serverless API entrypoint
|   +-- src/                # Express app, routes, controllers, models, middleware, config
|   +-- tests/              # Backend tests
+-- DEPLOYMENT.md           # Deployment notes
+-- README.md               # Repository entry point
```

## System Overview

The client and server are separate applications that communicate over HTTP.

```text
Browser
  |
  v
Next.js client
  |
  | Authorization: Bearer <jwt>
  v
Express API
  |
  +--> MongoDB through Mongoose
  +--> Optional Upstash Redis cache
  +--> SMTP email delivery
```

## Tech Stack

### Client

- Next.js 14 with React and TypeScript
- MUI v5 with Emotion
- TanStack React Query
- Zustand
- React Hook Form and Zod
- axios
- next-themes
- Sonner
- Framer Motion
- dnd-kit

### Server

- Node.js and TypeScript
- Express
- MongoDB with Mongoose
- JWT authentication
- Zod validation
- Upstash Redis caching
- Nodemailer email delivery
- Jest test tooling

## Quick Start

Install dependencies separately for each app:

```bash
cd server
npm install

cd ../client
npm install
```

Configure environment files:

- Server: copy `server/.env.example` to `server/.env`, then fill in database, JWT, email, Redis, and CORS values.
- Client: create `client/.env.local` and set `NEXT_PUBLIC_API_URL` to the server API base URL, including `/api`.

Run the applications in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Default local URLs:

- Client: `http://localhost:3000`
- Server API: usually `http://localhost:5000/api` or the port configured in `server/.env`

For app-specific setup details, use the [client README](client/README.md) and [server README](server/README.md).

## Common Commands

### Client

```bash
cd client
npm run dev
npm run build
npm start
npm run lint
```

### Server

```bash
cd server
npm run dev
npm run build
npm start
npm test
```

## Main Workflows

- Public landing page and authentication flows.
- Email verification during registration.
- Password reset through email verification.
- Authenticated dashboard with project and task summaries.
- Project list, project detail, project editing, and project deletion.
- Task list, task creation, task detail editing, status updates, and deletion.
- Kanban-style board interaction backed by task status updates.
- User profile, password, notification, theme, and logout settings.

## Current Documentation Boundaries

The root README intentionally stays high-level. Detailed implementation information belongs in the app-specific docs:

- Client behavior, routes, components, browser state, and frontend API usage live under `client/`.
- Server routes, database structure, middleware, caching, auth, and deployment behavior live under `server/`.

This keeps the root README stable as the main navigation page while reducing duplicate technical details.

## License

This project is licensed under the ISC License.

## Author

Camline - [CamlineKe](https://github.com/CamlineKe)
