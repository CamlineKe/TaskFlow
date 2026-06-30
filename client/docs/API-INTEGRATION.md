# TaskFlow Client API Integration

## Axios Client

API transport is centralized in `lib/axios.ts`.

The axios instance uses:

```text
process.env.NEXT_PUBLIC_API_URL || http://localhost:5001/api
```

All documented endpoints below are relative to that base URL.

## Authentication Header

The request interceptor reads the current token from `useAuthStore.getState()`. If a token exists, requests include:

```http
Authorization: Bearer <token>
```

The server must accept bearer tokens and expose the `/auth/me` endpoint for session hydration.

## Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | Recommended | Public base URL for the server API, including `/api`. |

Because this is a `NEXT_PUBLIC_*` variable, it is exposed to browser code. Do not put secrets in it.

## Endpoint Inventory

### Auth

| Method | Endpoint | Used By | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | `app/(auth)/login/page.tsx` | Authenticate user and return token/user. |
| `GET` | `/auth/me` | `components/layout/SessionLoader.tsx` | Hydrate current user from existing token. |
| `POST` | `/auth/initiate-registration` | `app/(auth)/register/page.tsx` | Start email verification registration flow. |
| `POST` | `/auth/verify-registration-email` | `app/(auth)/register/verify/page.tsx` | Verify registration email code. |
| `POST` | `/auth/complete-registration` | `app/(auth)/register/complete/page.tsx` | Complete account creation. |
| `POST` | `/auth/password-reset/request` | `app/(auth)/forgot-password/page.tsx` | Request reset email/code. |
| `POST` | `/auth/password-reset/verify` | `app/(auth)/reset-password/verify/page.tsx` | Verify reset code and receive reset token. |
| `POST` | `/auth/password-reset/reset` | `app/(auth)/reset-password/reset/page.tsx` | Submit new password. |

### Projects

| Method | Endpoint | Used By | Purpose |
|---|---|---|---|
| `GET` | `/projects` | Project list and task creation modals | Fetch user projects. |
| `POST` | `/projects` | `CreateProjectModal` | Create project. |
| `GET` | `/projects/dashboard/stats` | Dashboard page | Fetch dashboard summary data. |
| `GET` | `/projects/:projectId` | Project detail page | Fetch one project with tasks and metadata. |
| `PUT` | `/projects/:projectId` | Project card and edit modal | Update project metadata or status. |
| `DELETE` | `/projects/:projectId` | Project card | Delete project. |
| `GET` | `/projects/:projectId/board` | Board and task creation modals | Fetch project board columns and tasks. |

### Tasks

| Method | Endpoint | Used By | Purpose |
|---|---|---|---|
| `GET` | `/tasks` | Tasks page | Fetch user tasks. |
| `POST` | `/tasks` | Task creation modals | Create task. |
| `GET` | `/tasks/:taskId` | `TaskDetailModal` | Fetch task detail. |
| `PUT` | `/tasks/:taskId` | `TaskDetailModal` | Update task title/description. |
| `PUT` | `/tasks/:taskId/status` | Tasks page, project detail, board | Update task status. |
| `DELETE` | `/tasks/:taskId` | `TaskDetailModal` | Delete task. |

### Users

| Method | Endpoint | Used By | Purpose |
|---|---|---|---|
| `GET` | `/users/profile` | Settings page | Fetch profile and notification preferences. |
| `GET` | `/users/stats` | Settings page | Fetch user account statistics. |
| `PUT` | `/users/profile` | Settings page | Update profile fields. |
| `PUT` | `/users/notifications` | Settings page | Update notification preferences. |
| `PUT` | `/users/change-password` | Settings page | Change password while authenticated. |

## Request Patterns

### Queries

Read operations are usually wrapped in React Query `useQuery`. The query function calls `apiClient`, then returns `response.data` or a normalized subset of it.

Example patterns:

- Project list returns the response body directly.
- Task list expects a paginated response and returns `data.tasks || []`.
- Dashboard stats return the response body directly.

### Mutations

Write operations use React Query `useMutation`. Successful mutations usually:

- Show a success toast.
- Invalidate one or more related query keys.
- Close the active modal or dialog.
- Reset form state.

Errors usually show `error.response?.data?.message` with a fallback message.

## Security Notes

- `NEXT_PUBLIC_API_URL` is public browser configuration, not a secret.
- Auth tokens are persisted in browser storage through Zustand persistence.
- Registration state is temporarily held in `sessionStorage`.
- Password reset token and verification code are held in `sessionStorage` between code verification and password reset, then cleared after a successful reset.

## Reliability Notes

- The client depends on consistent server response shapes. The task list currently expects a `tasks` property from `/tasks`.
- Some 404 paths are handled explicitly, such as missing project or task records.
- There is no global axios response interceptor for 401 handling. Auth failures are handled mostly at the page/session boundary.
