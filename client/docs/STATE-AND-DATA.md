# TaskFlow Client State and Data

## State Layers

The client uses three main state layers:

- Local React state for component UI state.
- Zustand for persisted authentication state.
- TanStack React Query for server state and cache invalidation.

Form state is handled separately through React Hook Form and Zod.

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
| `['board', projectId]` | Board component. |
| `['project-board', projectId]` | Project-scoped create task modal. |
| `['projectBoard', projectId]` | Some board task mutation invalidations. |
| `['user-profile']` | Settings profile data. |
| `['user-stats']` | Settings account statistics. |

## Query Key Caveat

Board-related keys are not fully consistent:

- `['board', projectId]`
- `['project-board', projectId]`
- `['projectBoard', projectId]`

This can cause stale UI after mutations if the active query key is not invalidated. Documentation should preserve this detail until the implementation is cleaned up.

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
| Create task | `POST /tasks` | Varies by modal; usually tasks, project, board/dashboard keys. |
| Edit task | `PUT /tasks/:taskId` | task, project, tasks, dashboard, board-like keys. |
| Delete task | `DELETE /tasks/:taskId` | project, tasks, dashboard, board-like keys. |
| Update task status | `PUT /tasks/:taskId/status` | tasks, project, board/dashboard keys. |
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

The active theme provider uses `next-themes`; theme state is managed by that library rather than the legacy `themeMode` key in `components/providers/ThemeProvider.tsx`.

## Loading and Error States

Loading is mostly shown with MUI `CircularProgress`, skeleton cards, or empty fallback data.

Errors are shown through:

- MUI `Alert` for page-level fetch errors.
- Sonner toasts for mutation errors and workflow feedback.
- Redirect handling for known 404 cases.

## Observability Notes

Dashboard and tasks currently log data fetches and state summaries to the browser console. That can help during development, but it should be reviewed before production cleanup.
