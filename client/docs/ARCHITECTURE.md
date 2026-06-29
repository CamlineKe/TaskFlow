# TaskFlow Client Architecture

## Overview

The client is a browser-focused Next.js 14 application using the App Router. It is organized around public authentication routes, a public landing page, and a protected workspace under `/app`.

The main architectural split is:

- App shell and routing in `app/`.
- Shared UI and workflow components in `components/`.
- API transport in `lib/axios.ts`.
- Global providers in `lib/providers.tsx`.
- Auth persistence in `store/auth.store.ts`.
- Theme bridge helpers in `context/ThemeContext.tsx` and `lib/theme.ts`.

## Runtime Entry Points

- `app/layout.tsx`: root layout, metadata, font loading, and `Providers` wrapper.
- `lib/providers.tsx`: active provider tree for `next-themes`, MUI, React Query, React Query Devtools, `CssBaseline`, and Sonner toasts.
- `app/page.tsx`: public landing page.
- `app/(auth)/layout.tsx`: simple grouping layout for authentication pages.
- `app/app/layout.tsx`: authenticated application frame and access gate.

## Provider Stack

The active provider stack is defined in `lib/providers.tsx`.

Order:

1. `NextThemesProvider`
2. `MuiBridge`
3. `MuiThemeProvider`
4. `CssBaseline`
5. `QueryClientProvider`
6. `ReactQueryDevtools` in development
7. Sonner `Toaster`

`MuiBridge` maps the resolved `next-themes` value to the MUI light or dark theme from `lib/theme.ts`.

## Auth Boundary

The protected app is mounted under `app/app/layout.tsx`.

The layout:

- Reads auth state from `useAuthStore`.
- Redirects unauthenticated users to `/login`.
- Wraps protected content with `SessionLoader`.
- Provides desktop sidebar and mobile header navigation.
- Provides logout behavior by clearing the auth store and routing to `/login`.

`SessionLoader` checks whether a token exists without a user object. If so, it calls `/auth/me` and hydrates the store. If hydration fails, it logs the user out.

## API Flow

Client API calls go through `lib/axios.ts`.

Request flow:

1. Feature component or page calls `apiClient`.
2. Axios uses `NEXT_PUBLIC_API_URL` or the local fallback.
3. Request interceptor reads the persisted Zustand auth token.
4. If a token exists, it attaches `Authorization: Bearer <token>`.
5. React Query caches server responses for query-backed workflows.

## Data Fetching Model

Server state is mostly handled with TanStack React Query.

Common query-backed areas:

- Dashboard stats
- Project list
- Project detail
- Project board
- Task list
- Task detail
- User profile
- User stats

Mutations invalidate query keys after successful writes. This keeps the UI eventually consistent with server state, but some keys are not named consistently across components. See [State and Data](STATE-AND-DATA.md).

## UI Architecture

The application uses MUI components directly with local `sx` styling. There is no custom design system layer beyond shared components such as modals, cards, board columns, and task cards.

Primary UI groups:

- `components/ui`: generic modal and confirmation modal.
- `components/layout`: session loading behavior.
- `components/projects`: project cards and project/task modals.
- `components/tasks`: task creation and completion confirmation.
- `components/board`: kanban board, columns, draggable task cards, task detail modal.

## Theming

Theme configuration lives in `lib/theme.ts`.

The active app uses:

- `next-themes` for resolved light/dark mode.
- MUI `createTheme` objects for component styling.
- `useThemeContext` as a convenience bridge for pages and layouts.

`components/providers/ThemeProvider.tsx` appears to be an older provider implementation using a separate `themeMode` localStorage value. It is not referenced by the root layout and should not be treated as the active runtime provider.

## Operational Notes

- The client requires the server API to be available for authenticated functionality.
- Development tools include React Query Devtools when `NODE_ENV` is `development`.
- Error feedback is primarily shown through Sonner toasts and MUI alerts.
- Browser storage is used for persisted auth state and temporary registration flow state.

## Known Constraints

- Query key naming is inconsistent in some board/task/project paths.
- Password reset token and code are passed through URL query parameters after verification.
- Some pages include development `console.log` statements.
- Several task creation modals overlap in responsibility.
