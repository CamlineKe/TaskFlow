# TaskFlow Client Components

## Component Organization

Components are grouped by feature:

- `components/layout`: authenticated session loading.
- `components/ui`: shared modal primitives.
- `components/projects`: project cards and project-scoped modals.
- `components/tasks`: task list workflow modals.
- `components/board`: board, columns, draggable cards, and task detail modal.
- `types`: shared task, project, board, and user summary type definitions.

## Layout Components

### SessionLoader

File: `components/layout/SessionLoader.tsx`

Responsible for hydrating user state when a token exists but the user object is missing. It calls `/auth/me`, updates the auth store on success, logs out on failure, and shows a full-screen loading state while checking.

## Shared UI Components

### Modal

File: `components/ui/Modal.tsx`

Shared wrapper around MUI dialog behavior. Used by project and task workflows.

### ConfirmationModal

File: `components/ui/ConfirmationModal.tsx`

Reusable confirmation dialog for destructive or important actions, such as deleting tasks and projects.

## Project Components

### ProjectCard

File: `components/projects/ProjectCard.tsx`

Displays project metadata in grid or list mode. Handles:

- Navigation to project detail.
- Status display.
- Progress calculation.
- Edit modal opening.
- Delete confirmation.
- Project status toggle.

The edit and confirmation dialogs are dynamically imported because they are only needed after user interaction.

### CreateProjectModal

File: `components/projects/CreateProjectModal.tsx`

Creates a project with name, optional description, optional due date, and status. Uses Zod validation and invalidates `['projects']` after success.

### EditProjectModal

File: `components/projects/EditProjectModal.tsx`

Updates project name, description, status, and due date. Invalidates `['projects']` and `['project', projectId]` after success.

### ProjectCardSkeleton

File: `components/projects/ProjectCardSkeleton.tsx`

Loading placeholder for project card lists.

### CreateTaskModalForProject

File: `components/projects/CreateTaskModalForProject.tsx`

Project-specific wrapper around the shared task creation modal.

## Task Components

### CreateTaskModal

File: `components/tasks/CreateTaskModal.tsx`

Shared task creation implementation. It can operate globally by asking for a project, in a project context by receiving `projectId`, or in a board-column context by receiving both `projectId` and `columnId`.

### TaskCompletionConfirmModal

File: `components/tasks/TaskCompletionConfirmModal.tsx`

Confirms whether a task should be marked complete or reopened.

## Board Components

### Board

File: `components/board/Board.tsx`

Renders project board columns and tasks using `@dnd-kit/core`.

Responsibilities:

- Fetch board data from `/projects/:projectId/board`.
- Render `BoardColumn` instances.
- Render draggable `TaskCard` items.
- Open `TaskDetailModal`.
- Persist drag/drop column changes as task status updates.

The board does not currently persist arbitrary task ordering.

### BoardColumn

File: `components/board/Column.tsx`

Droppable board column. Displays column title, task count through children, and a project/column-scoped task creation modal.

### TaskCard

File: `components/board/TaskCard.tsx`

Draggable board task card. Displays priority, title, truncated description, due date, assignee, and project metadata.

### Board CreateTaskModal

File: `components/board/CreateTaskModal.tsx`

Board-column wrapper around the shared task creation modal. Requires explicit `projectId` and `columnId`.

### TaskDetailModal

File: `components/board/TaskDetailModal.tsx`

Fetches task detail, edits task title/description, deletes tasks, and invalidates related task/project/dashboard queries.

## Provider Components

### Active Provider Stack

File: `lib/providers.tsx`

This is the active provider stack used by `app/layout.tsx`.

It provides:

- `next-themes`
- MUI theme bridge
- `CssBaseline`
- React Query
- React Query Devtools in development
- Sonner toasts

## Component Design Patterns

Common patterns:

- Task creation uses the shared `components/tasks/CreateTaskModal.tsx` implementation with context-specific wrappers.
- Route pages dynamically import heavier modal and board components where those surfaces are not required for first paint.
- Mutations show Sonner toasts.
- Successful task mutations use shared React Query invalidation helpers from `lib/queryKeys.ts`.
- Form inputs use React Hook Form and Zod.
- MUI `sx` props are used directly for layout and styling.
