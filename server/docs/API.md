# API Reference

Base path: `/api`

Protected endpoints require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Validation errors use this general shape:

```json
{
  "message": "Validation error",
  "errors": []
}
```

Most controller failures currently return:

```json
{
  "message": "Human-readable error",
  "error": "Implementation error message when available"
}
```

## Shared Status Codes

| Status | Meaning |
|---:|---|
| `200` | Request succeeded. |
| `201` | Resource or registration step completed. |
| `400` | Invalid input, invalid ObjectId, invalid code, or inconsistent board/task state. |
| `401` | Missing or invalid bearer token. |
| `403` | Authenticated user does not have access to the resource. |
| `404` | Resource not found, or inaccessible resource intentionally returned as not found. |
| `409` | Duplicate user email during registration. |
| `500` | Unhandled server or integration failure. |

## Public Utility

### `GET /api/cors-test`

Debug endpoint for verifying CORS headers.

Authentication: none.

Response includes request origin, timestamp, and visible CORS response headers.

## Auth

Mounted at `/api/auth`.

### `POST /api/auth/register`

Legacy direct registration. Creates a user immediately and returns a JWT.

Authentication: none.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Validation:

- `name`: string, at least 2 characters.
- `email`: valid email.
- `password`: string, at least 6 characters.

Success: `201`

```json
{
  "user": {},
  "token": "<jwt>"
}
```

### `POST /api/auth/login`

Authenticates an existing user and returns a JWT.

Authentication: none.

Body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Success: `200`

```json
{
  "user": {},
  "token": "<jwt>"
}
```

### `GET /api/auth/me`

Returns the authenticated user without the password field.

Authentication: required.

Success: `200`

```json
{
  "_id": "<userId>",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

## Email Verification Registration

There are two route naming styles that call the same controllers. Prefer the `/register/*` style for new clients because it groups the flow clearly.

### `POST /api/auth/register/initiate`

Alias: `POST /api/auth/initiate-registration`

Starts registration by storing a temporary email verification document and sending a code.

Authentication: none.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Success: `200`

```json
{
  "message": "Verification code sent to your email. Please check your inbox.",
  "token": "<verificationToken>"
}
```

In non-production, a `previewUrl` may be included when Nodemailer uses Ethereal.

### `POST /api/auth/register/verify-email`

Alias: `POST /api/auth/verify-registration-email`

Marks an email verification document as verified when the code is valid and not expired.

Authentication: none.

Body:

```json
{
  "email": "jane@example.com",
  "code": "123456"
}
```

Success: `200`

```json
{
  "message": "Email verified successfully.",
  "token": "<verificationToken>"
}
```

### `POST /api/auth/register/complete`

Alias: `POST /api/auth/complete-registration`

Creates the final user from the verified email verification document.

Authentication: none.

Body:

```json
{
  "token": "<verificationToken>",
  "code": "123456"
}
```

Success: `201`

```json
{
  "message": "Registration completed successfully! Please log in with your credentials.",
  "success": true
}
```

Implementation note: if the verification document is missing, the current controller still returns success. This makes completion idempotent from the client perspective.

## Password Reset

### `POST /api/auth/password-reset/request`

Creates a reset token and sends a 6-digit code by email.

Authentication: none.

Body:

```json
{
  "email": "jane@example.com"
}
```

Success: `200`

```json
{
  "message": "Password reset instructions sent to your email.",
  "token": "<resetToken>"
}
```

### `POST /api/auth/password-reset/verify`

Verifies the reset code for an email address and returns the reset token.

Authentication: none.

Body:

```json
{
  "email": "jane@example.com",
  "code": "123456"
}
```

Success: `200`

```json
{
  "message": "Code verified successfully.",
  "token": "<resetToken>"
}
```

### `POST /api/auth/password-reset/reset`

Sets a new password using the reset token and code.

Authentication: none.

Body:

```json
{
  "token": "<resetToken>",
  "code": "123456",
  "newPassword": "newsecret123"
}
```

Success: `200`

```json
{
  "message": "Password reset successfully. You can now log in with your new password."
}
```

## Projects

Mounted at `/api/projects`.

All project routes require authentication.

### `GET /api/projects/dashboard/stats`

Returns dashboard summary data for projects the authenticated user owns or belongs to.

Success includes:

- `totalTasks`
- `completedTasks`
- `inProgressTasks`
- `pendingTasks`
- `overdueTasks`
- `activeProjects`
- `recentTasks`
- `recentProjects`

Cache key: `dashboard:stats:<userId>`.

### `GET /api/projects`

Lists projects where the user is owner or member.

Success: `200`

Each item includes project metadata plus computed `totalTasks` and `completedTasks`.

Cache key: `user:projects:<userId>`.

### `POST /api/projects`

Creates a project, creates a board, and creates default columns:

- `To Do`
- `In Progress`
- `Done`

Authentication: required.

Body:

```json
{
  "name": "Website Redesign",
  "description": "Launch the new marketing site",
  "status": "active",
  "dueDate": "2026-08-01"
}
```

Validation:

- `name`: string, at least 3 characters.
- `description`: optional string.
- `status`: `active`, `completed`, or `on-hold`. Defaults to `active`.
- `dueDate`: optional date string transformed to `Date`.

Success: `201`

### `GET /api/projects/:projectId`

Returns project detail with owner, members, flattened tasks, and task counts.

Authentication: required. User must be owner or member.

Cache key: `project:detail:<projectId>`.

### `GET /api/projects/:projectId/board`

Returns board data with populated columns and tasks.

Authentication: required. User must be owner or member.

Cache key: `project:board:<projectId>`.

### `PUT /api/projects/:projectId`

Updates project metadata.

Authentication: required. Only the project owner can update.

Body:

```json
{
  "name": "Website Refresh",
  "description": "Updated scope",
  "status": "on-hold",
  "dueDate": "2026-09-01"
}
```

All fields are optional, but supplied fields must pass validation.

### `DELETE /api/projects/:projectId`

Deletes the project, associated board, columns, and tasks.

Authentication: required. Only the project owner can delete.

Success: `200`

```json
{
  "message": "Project deleted successfully"
}
```

## Tasks

Mounted at `/api/tasks`.

All task routes require authentication.

### `GET /api/tasks`

Lists tasks from projects the authenticated user can access.

Query params:

- `page`: optional positive integer. Defaults to `1`.
- `limit`: optional positive integer. Defaults to `50`, maximum `100`.

Success: `200`

```json
{
  "tasks": [],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### `GET /api/tasks/:taskId`

Returns a task with project, assignee, column, computed `status`, and `completed`.

Authentication: required. User must be able to access the task project.

### `POST /api/tasks`

Creates a task in a project column.

Authentication: required. User must be able to access the project, and the column must belong to the project board.

Body:

```json
{
  "title": "Draft homepage copy",
  "description": "Write first pass",
  "priority": "medium",
  "projectId": "<projectId>",
  "columnId": "<columnId>"
}
```

Validation:

- `title`: non-empty string.
- `description`: optional string.
- `priority`: `low`, `medium`, or `high`. Defaults to `medium`.
- `projectId`: valid ObjectId.
- `columnId`: valid ObjectId.

Task status is inferred from the target column title.

### `PUT /api/tasks/:taskId`

Updates task fields.

Authentication: required. User must be able to access the task project.

Body:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "high"
}
```

All fields are optional.

### `PUT /api/tasks/:taskId/status`

Moves a task to the column matching a requested status.

Authentication: required. User must be able to access the task project.

Body:

```json
{
  "status": "completed"
}
```

Allowed statuses:

- `todo`
- `in-progress`
- `completed`

Column matching is title-based:

- completed: title contains `done` or `complete`
- in progress: title contains `progress` or `doing`
- todo: title contains `to do`, `todo`, `backlog`, or falls back to first column

### `DELETE /api/tasks/:taskId`

Deletes a task and removes it from its column task list.

Authentication: required. User must be able to access the task project.

Success: `200`

```json
{
  "message": "Task deleted successfully"
}
```

## Columns

Mounted at `/api/columns`.

All column routes require authentication.

### `PUT /api/columns/move-task`

Handles board drag-and-drop reordering and cross-column movement.

Authentication: required. User must be able to access the task project.

Body:

```json
{
  "taskId": "<taskId>",
  "sourceColumnId": "<sourceColumnId>",
  "destinationColumnId": "<destinationColumnId>",
  "destinationIndex": 0
}
```

Validation:

- all IDs must be valid ObjectIds.
- `destinationIndex` must be a non-negative number.

Behavior:

- Source column must match the task current column.
- Source and destination columns must belong to the task project board.
- Same-column moves reorder `Column.tasks`.
- Cross-column moves update source column, destination column, task column, and task status.

Success: `200`

```json
{
  "message": "Task moved successfully"
}
```

## Users

Mounted at `/api/users`.

All user routes require authentication.

### `GET /api/users/profile`

Returns the authenticated user profile without password.

### `PUT /api/users/profile`

Updates profile fields.

Body:

```json
{
  "name": "Jane Doe",
  "bio": "Product manager",
  "location": "Nairobi",
  "website": "https://example.com",
  "avatar": "https://example.com/avatar.png"
}
```

Validation:

- `name`: required, 1 to 100 characters.
- `bio`: optional, max 500 characters.
- `location`: optional, max 100 characters.
- `website`: optional, max 200 characters.
- `avatar`: optional URL or empty string.

### `PUT /api/users/change-password`

Changes the authenticated user's password.

Body:

```json
{
  "currentPassword": "oldsecret123",
  "newPassword": "newsecret123"
}
```

Validation:

- `currentPassword`: required string.
- `newPassword`: at least 6 characters.

### `PUT /api/users/notifications`

Updates notification preferences.

Body:

```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "taskReminders": true
}
```

### `GET /api/users/stats`

Returns user/project/task statistics for the authenticated user.

Response includes:

- project totals by status
- task totals by status
- personal assigned task counts
- priority breakdown
- month-based task counts
- member since date
- recent completed tasks
