# TaskFlow Client

Frontend application for TaskFlow, a project and task management product. The client is a Next.js App Router application that provides public authentication flows, a marketing landing page, and a protected project workspace backed by the TaskFlow server API.

## Documentation

- [Architecture Reference](docs/ARCHITECTURE.md): application structure, provider stack, protected layout, theming, and runtime flow.
- [Routes Reference](docs/ROUTES.md): public and authenticated routes, page responsibilities, and navigation behavior.
- [API Integration Reference](docs/API-INTEGRATION.md): axios setup, environment variables, endpoint usage, auth headers, and security notes.
- [State and Data Reference](docs/STATE-AND-DATA.md): Zustand auth state, React Query usage, query keys, invalidation, and forms.
- [Components Reference](docs/COMPONENTS.md): layout, project, task, board, and shared UI component responsibilities.

## Runtime

The application uses Next.js 14 with the App Router.

- `app/layout.tsx`: root HTML shell, metadata, font setup, and global provider wrapper.
- `lib/providers.tsx`: active runtime provider stack for theme, MUI, React Query, devtools, baseline CSS, and toast notifications.
- `app/page.tsx`: public landing page.
- `app/(auth)/*`: login, registration, email verification, and password reset flows.
- `app/app/layout.tsx`: authenticated application shell with sidebar, mobile header, breadcrumbs, logout, and session protection.
- `app/app/*`: dashboard, projects, project detail, tasks, and settings pages.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Required Environment

Create `client/.env.local` for local client configuration. Do not commit real environment files.

Core variable:

- `NEXT_PUBLIC_API_URL`: base URL for the TaskFlow server API, including the `/api` prefix.

If `NEXT_PUBLIC_API_URL` is not set, the axios client falls back to:

```text
http://localhost:5001/api
```

## Authentication

The client stores authentication state in a persisted Zustand store named `auth-storage`. Protected requests use:

```http
Authorization: Bearer <jwt>
```

The protected app layout uses `SessionLoader` to hydrate the current user with `/auth/me` when a token exists but the user object is missing.

## Main Workflows

- Registration: initiate registration, verify email code, complete account creation.
- Login: authenticate with email and password, persist token and user.
- Password reset: request reset, verify reset code, submit new password.
- Dashboard: fetch project and task summary data from the server.
- Projects: list, filter, create, update status, edit, delete, and open project detail.
- Project detail: view project metadata, task list, and board.
- Board: drag tasks between board columns; the persisted operation is a task status update.
- Tasks: list, search, filter, create, view/edit/delete, and mark complete.
- Settings: update profile, password, notification preferences, theme, and logout.

## Development Notes

- Client-side validation uses Zod with React Hook Form.
- Server state uses TanStack React Query.
- Auth state uses Zustand with persistence to browser storage.
- Toast notifications are handled by Sonner.
- The active theme implementation is wired through `next-themes`, `lib/providers.tsx`, and `context/ThemeContext.tsx`.
- Task creation is routed through the shared `components/tasks/CreateTaskModal.tsx` implementation.

## Known Constraints

- Password reset token and code are temporarily held in `sessionStorage` after code verification and cleared after a successful reset.
- Project and task entity types are still duplicated in several page/component files.
