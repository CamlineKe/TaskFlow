# Database Reference

The server uses MongoDB through Mongoose models in `src/models`.

## Relationship Overview

```text
User
  owns many Projects
  belongs to many Projects through Project.members

Project
  has one Board
  has many Tasks

Board
  belongs to one Project
  has ordered Columns

Column
  belongs to one Board
  has ordered Tasks

Task
  belongs to one Project
  belongs to one Column
  may have one assignee User
```

Token collections:

```text
ResetToken
  belongs to one User
  expires through TTL index

EmailVerification
  stores temporary registration data
  expires through TTL index
```

## Collections

Mongoose pluralizes model names into MongoDB collections. Aggregation code currently refers to:

- `users`
- `projects`
- `boards`
- `columns`
- `tasks`

## User

Source: `src/models/User.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required, trimmed. |
| `email` | string | Required, unique, lowercase, trimmed. |
| `password` | string | Required, `select: false`, bcrypt-hashed before save. |
| `bio` | string | Optional, max 500. |
| `location` | string | Optional, max 100. |
| `website` | string | Optional, max 200. |
| `avatar` | string | Optional. |
| `notificationPreferences.emailNotifications` | boolean | Defaults to `true`. |
| `notificationPreferences.pushNotifications` | boolean | Defaults to `true`. |
| `notificationPreferences.taskReminders` | boolean | Defaults to `true`. |
| `projects` | ObjectId[] | References `Project`. Currently not the primary project lookup path. |
| `createdAt`, `updatedAt` | Date | From timestamps. |

Behavior:

- Passwords are hashed in a pre-save hook.
- The model exposes `comparePassword(candidatePassword)`.
- Passwords are excluded by default from queries.

## Project

Source: `src/models/project.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `name` | string | Required, trimmed. |
| `description` | string | Optional, trimmed. |
| `status` | enum | `active`, `completed`, `on-hold`; defaults to `active`. |
| `dueDate` | Date | Optional. |
| `owner` | ObjectId | Required, references `User`. |
| `members` | ObjectId[] | References `User`. Owner is added as a member at creation time. |
| `board` | ObjectId | Required, references `Board`. |
| `createdAt`, `updatedAt` | Date | From timestamps. |

Indexes:

| Index | Purpose |
|---|---|
| `{ owner: 1, members: 1 }` | Finding projects visible to a user. |
| `{ _id: 1, owner: 1, members: 1 }` | Project lookup with access check. |
| `{ status: 1 }` | Status filtering. |
| `{ dueDate: 1 }` | Due-date sorting/filtering. |
| `{ createdAt: -1 }` | Recent project sorting. |
| `{ name: 'text', description: 'text' }` | Text search support. |

Lifecycle:

- Project creation also creates a board and default columns.
- Project deletion deletes associated board, columns, and tasks.
- Only project owners can update or delete projects.
- Project members can read project data and mutate tasks.

## Board

Source: `src/models/board.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `project` | ObjectId | Required, unique, references `Project`. |
| `columns` | ObjectId[] | Ordered list of `Column` references. |
| `createdAt`, `updatedAt` | Date | From timestamps. |

Indexes:

| Index | Purpose |
|---|---|
| `{ project: 1 }` | Board lookup by project. |

Invariant:

- A project should have exactly one board.
- The horizontal order of columns is represented by the order of `Board.columns`.

## Column

Source: `src/models/column.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Required, trimmed. |
| `board` | ObjectId | Required, references `Board`. |
| `tasks` | ObjectId[] | Ordered list of `Task` references. |
| `createdAt`, `updatedAt` | Date | From timestamps. |

Indexes:

| Index | Purpose |
|---|---|
| `{ board: 1 }` | Populate board columns. |
| `{ tasks: 1 }` | Find columns containing a task. |

Invariant:

- The vertical order of cards on a board is represented by the order of `Column.tasks`.
- Task movement must update both the task document and the source/destination column task arrays.

## Task

Source: `src/models/task.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Required, trimmed. |
| `description` | string | Optional, trimmed. |
| `priority` | enum | `low`, `medium`, `high`; defaults to `medium`. |
| `status` | enum | `todo`, `in-progress`, `completed`; defaults to `todo`. |
| `project` | ObjectId | Required, references `Project`. |
| `column` | ObjectId | Required, references `Column`. |
| `assignee` | ObjectId | Optional, references `User`. |
| `createdAt`, `updatedAt` | Date | From timestamps. |

Indexes:

| Index | Purpose |
|---|---|
| `{ project: 1, status: 1 }` | Project task stats and status filtering. |
| `{ column: 1 }` | Task movement and column lookups. |
| `{ assignee: 1 }` | User task stats. |
| `{ createdAt: -1 }` | Recent task sorting. |
| `{ dueDate: 1, status: 1 }` | Intended overdue task lookup, but see known constraint below. |

Status behavior:

- Task status is stored on the task document.
- Some read and movement paths also infer status from column titles:
  - `Done` or title containing `complete` maps to `completed`.
  - `In Progress` or title containing `doing` maps to `in-progress`.
  - Other columns map to `todo`.

Known constraint:

- Dashboard code references `Task.dueDate`, and the task model has a `dueDate` index, but the schema/interface do not define `dueDate`. Either add `dueDate` to tasks or remove overdue-task logic and the index in a future cleanup.

## ResetToken

Source: `src/models/resetToken.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Required, references `User`. |
| `token` | string | Required, unique, generated with `crypto.randomBytes(32)`. |
| `code` | string | Required, 6-digit numeric code. |
| `createdAt` | Date | Defaults to now. |
| `expiresAt` | Date | Required, TTL index. |
| `isValid` | boolean | Defaults to `true`; set false after reset. |

Lifecycle:

- Existing reset tokens for a user are deleted before a new one is created.
- Expired documents are removed by MongoDB TTL behavior.

## EmailVerification

Source: `src/models/emailVerification.model.ts`

Fields:

| Field | Type | Notes |
|---|---|---|
| `email` | string | Required, lowercase, trimmed. |
| `name` | string | Required, trimmed. |
| `password` | string | Required, stores the pre-hashed password during registration. |
| `verificationCode` | string | Required, 6-digit numeric code. |
| `token` | string | Required, unique. |
| `createdAt` | Date | Defaults to now. |
| `expiresAt` | Date | Required, TTL index. |
| `isVerified` | boolean | Defaults to `false`. |

Lifecycle:

- Existing verification documents for an email are deleted before initiating a new registration.
- Completion creates the final `User` and deletes the verification document.
- Expired documents are removed by MongoDB TTL behavior.

## Cache Keys

Source: `src/config/redis.ts`

| Key | Meaning |
|---|---|
| `project:board:<projectId>` | Populated board data. |
| `project:detail:<projectId>` | Project detail data. |
| `user:projects:<userId>` | Project list for one user. |
| `user:tasks:<userId>` | Task list for one user. |
| `dashboard:stats:<userId>` | Dashboard stats for one user. |

Invalidation:

- Project mutations invalidate project board/detail and participant-specific project/task/dashboard keys.
- Task and column mutations invalidate project board/detail and participant-specific project/task/dashboard keys.
- Redis failures are swallowed so cache issues do not break request handling.

## Data Integrity Notes

- The code currently performs multi-document writes without MongoDB transactions.
- Project create writes a project, board, and columns.
- Task create writes a task and pushes the task id into a column.
- Task move updates one or two columns and the task document.
- Project delete removes tasks, columns, board, and project.

If the application later requires stronger consistency under concurrency, these flows are good candidates for MongoDB transactions.
