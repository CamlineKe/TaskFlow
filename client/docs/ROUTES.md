# TaskFlow Client Routes

## Route Groups

The client uses Next.js App Router route groups:

- `app/page.tsx`: public landing page.
- `app/(auth)/*`: authentication and account recovery routes.
- `app/app/*`: protected application routes.

## Public Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Public landing page with product messaging and calls to login/register. |
| `/login` | `app/(auth)/login/page.tsx` | Email/password login. Persists user and token, then routes to `/app`. |
| `/register` | `app/(auth)/register/page.tsx` | Starts registration and stores registration token/email in `sessionStorage`. |
| `/register/verify` | `app/(auth)/register/verify/page.tsx` | Verifies email code and stores verification token/code in `sessionStorage`. |
| `/register/complete` | `app/(auth)/register/complete/page.tsx` | Completes registration and clears registration session values. |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Requests password reset instructions. |
| `/reset-password/verify` | `app/(auth)/reset-password/verify/page.tsx` | Verifies password reset code, stores reset session values, and routes to reset form. |
| `/reset-password/reset` | `app/(auth)/reset-password/reset/page.tsx` | Submits new password using reset token and verification code. |

## Protected Routes

All protected routes are children of `app/app/layout.tsx`.

| Route | File | Purpose |
|---|---|---|
| `/app` | `app/app/page.tsx` | Dashboard with task/project summary, recent tasks, recent projects, and quick actions. |
| `/app/projects` | `app/app/projects/page.tsx` | Project list, search, status tabs, grid/list mode, and create project modal. |
| `/app/projects/[projectId]` | `app/app/projects/[projectId]/page.tsx` | Project detail, task list, project edit flow, task creation, and board tab. |
| `/app/tasks` | `app/app/tasks/page.tsx` | Cross-project task list with search, filters, create task, status updates, and task detail modal. |
| `/app/settings` | `app/app/settings/page.tsx` | Profile, password, notifications, theme toggle, account stats, and logout. |

## Navigation Model

The protected layout defines the primary navigation:

- Dashboard: `/app`
- Projects: `/app/projects`
- My Tasks: `/app/tasks`
- Settings: `/app/settings`

Desktop users see a permanent drawer. Mobile users see a top app bar and temporary drawer.

## Route Protection

`app/app/layout.tsx` checks `useAuthStore().isAuthenticated`.

If the user is not authenticated:

1. `RedirectToLogin` routes to `/login`.
2. A loading spinner is displayed while the redirect happens.

If a token exists but user data is missing, `SessionLoader` calls `/auth/me` before rendering protected children.

## Auth Flow Details

### Login

1. User submits email and password.
2. Client posts to `/auth/login`.
3. Response user and token are saved in Zustand.
4. User is routed to `/app`.

### Registration

1. `/register` posts to `/auth/initiate-registration`.
2. Registration token and email are stored in `sessionStorage`.
3. `/register/verify` posts code and token to `/auth/verify-registration-email`.
4. Verification token and code are stored in `sessionStorage`.
5. `/register/complete` posts to `/auth/complete-registration`.
6. Registration session values are cleared.

### Password Reset

1. `/forgot-password` posts to `/auth/password-reset/request`.
2. User navigates to `/reset-password/verify`.
3. Verification page posts to `/auth/password-reset/verify`.
4. Reset token and code are stored temporarily in `sessionStorage`.
5. Reset page posts token, code, and new password to `/auth/password-reset/reset`.

The reset token/code values are cleared after a successful password reset.

## Project Workflow

The project list fetches `/projects` and renders project cards. Project cards can:

- Open project detail.
- Edit project metadata.
- Toggle completion status.
- Delete a project after confirmation.

Project detail fetches `/projects/:projectId`. A deleted or missing project returns a 404, and the page redirects back to `/app/projects`.

## Task Workflow

The task list fetches `/tasks` and expects a paginated response shape with a `tasks` property. It supports:

- Search by task title or project name.
- Filter by priority, status, project presence, and due date presence.
- Create task.
- Open task detail modal.
- Mark task complete or return it to todo.

Task detail fetches `/tasks/:taskId`, updates with `PUT /tasks/:taskId`, and deletes with `DELETE /tasks/:taskId`.

## Board Workflow

Project board data is fetched from `/projects/:projectId/board`.

The board displays server-provided columns and draggable task cards. Dragging a task between columns persists as:

```http
PUT /tasks/:taskId/status
```

The target status is inferred from the destination column title:

- Column titles containing `done` or `complete`: `completed`
- Column titles containing `progress` or `doing`: `in-progress`
- Other column titles: `todo`

The client does not currently persist arbitrary column order or task order through the board drag/drop path.
