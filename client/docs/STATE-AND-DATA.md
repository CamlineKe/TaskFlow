# TaskFlow Client State and Data

## State Layers

The client uses three main state layers:

- Local React state for component UI state.
- Zustand for persisted authentication state.
- TanStack React Query for server state and cache invalidation.

Form state is handled separately through React Hook Form and Zod.

Shared domain types for common server objects live in `types/domain.ts`.

## Auth Store

File: `store/auth.store.ts`

The auth store keeps:

- `user`
- `token`
- `isAuthenticated`

Actions:

- `setUser(user, token?)`
- `updateUser(partialUser)`
- `logout()`

The store uses Zustand `persist` with the storage key:

```text
auth-storage
```

This means auth state survives browser refreshes.

## Session Hydration

File: `components/layout/SessionLoader.tsx`

When a token exists but no user object is loaded, `SessionLoader` calls:

```http
GET /auth/me
```

Success updates the auth store with the current user. Failure logs the user out.

## React Query Provider

File: `lib/providers.tsx`

`QueryClientProvider` is created once per mounted provider instance with:

```ts
const [queryClient] = useState(() => new QueryClient());
```

React Query Devtools are enabled in development only.

## Query Keys

Common query keys:

| Query Key | Main Usage |
|---|---|
| `['dashboard']` | Dashboard stats. |
| `['projects']` | Project list. |
| `['project', projectId]` | Project detail. |
| `['tasks']` | Task list. |
| `['task', taskId]` | Task detail modal. |
| `['board', projectId]` | Board data and board-related invalidation. |
| `['user-profile']` | Settings profile data. |
| `['user-stats']` | Settings account statistics. |

## Query Key Helpers

Query keys are centralized in `lib/queryKeys.ts`. Task mutations should use `invalidateTaskViews` so task, dashboard, project detail, and board data stay aligned after task create/update/delete/status changes.

## Main Data Fetches

| Feature | Query | Endpoint |
|---|---|---|
| Dashboard | `['dashboard']` | `/projects/dashboard/stats` |
| Projects | `['projects']` | `/projects` |
| Project detail | `['project', projectId]` | `/projects/:projectId` |
| Board | `['board', projectId]` | `/projects/:projectId/board` |
| Tasks | `['tasks']` | `/tasks` |
| Task detail | `['task', taskId]` | `/tasks/:taskId` |
| User profile | `['user-profile']` | `/users/profile` |
| User stats | `['user-stats']` | `/users/stats` |

## Main Mutations

| Feature | Endpoint | Common Invalidations |
|---|---|---|
| Create project | `POST /projects` | `['projects']` |
| Edit project | `PUT /projects/:projectId` | `['projects']`, `['project', projectId]` |
| Delete project | `DELETE /projects/:projectId` | `['projects']` |
| Create task | `POST /tasks` | `invalidateTaskViews` with project context. |
| Edit task | `PUT /tasks/:taskId` | `invalidateTaskViews` with project and task context. |
| Delete task | `DELETE /tasks/:taskId` | `invalidateTaskViews` with project context. |
| Update task status | `PUT /tasks/:taskId/status` | `invalidateTaskViews` with available project context. |
| Update profile | `PUT /users/profile` | `['user-profile']` and Zustand user. |
| Update notifications | `PUT /users/notifications` | `['user-profile']` |
| Change password | `PUT /users/change-password` | No query invalidation required. |

## Form Validation

Forms use React Hook Form with Zod schemas near the component that owns the form.

Examples:

- Login: email and password.
- Register: name, email, password.
- Password reset: token, code, new password, confirmation.
- Project create/edit: name, description, status, due date.
- Task create/edit: title, description, priority, project/column context.
- Settings profile: name, bio, location, website.
- Settings password: current password, new password, confirmation.

## Browser Storage

| Storage | Key or Values | Purpose |
|---|---|---|
| localStorage through Zustand persist | `auth-storage` | Auth user/token persistence. |
| sessionStorage | `registrationToken` | Registration flow token. |
| sessionStorage | `registrationEmail` | Registration flow email. |
| sessionStorage | `verificationToken` | Registration verification token. |
| sessionStorage | `verificationCode` | Registration verification code. |
| sessionStorage | `passwordResetToken` | Password reset token after reset-code verification. |
| sessionStorage | `passwordResetCode` | Password reset code after verification. |

The active theme provider uses `next-themes`; theme state is managed by that library.

## Loading and Error States

Loading is mostly shown with MUI `CircularProgress`, skeleton cards, or empty fallback data.

Errors are shown through:

- MUI `Alert` for page-level fetch errors.
- Sonner toasts for mutation errors and workflow feedback.
- Redirect handling for known 404 cases.

## Observability Notes

Session verification failures are logged in development only. User-facing workflow feedback is handled through Sonner toasts and MUI alerts.
