# 14 — Frontend Architecture

Next.js App Router design. Stack: Next.js (App Router), TypeScript, Tailwind, Framer Motion, TanStack React Query, Axios (CON-01). Charts: Recharts (ADR-014). Auth transport: httpOnly cookie (ADR-008).

## 1. Route map

```
app/
  (public)/
    page.tsx                 # landing / redirect
    login/page.tsx
    register/page.tsx
    verify-email/page.tsx
  (protected)/
    layout.tsx               # requires auth (guard)
    dashboard/page.tsx       # user stats
    files/page.tsx           # My Files (list/search/filter/sort/paginate/upload)
    files/[id]/page.tsx      # file details + preview
    profile/page.tsx
    (admin)/
      layout.tsx             # requires ADMIN (guard)
      admin/page.tsx         # admin dashboard
      admin/users/page.tsx
      admin/files/page.tsx
  layout.tsx                 # root: providers, theme, toaster
  not-found.tsx
  error.tsx                  # route error boundary
```

Route groups `(public)`, `(protected)`, `(admin)` isolate layouts/guards without affecting URLs.

## 2. Server vs Client components

| Concern | Type | Why |
|---|---|---|
| Root layout, static shells, marketing copy | **Server** | No interactivity; smaller JS. |
| Providers (React Query, Theme, Toaster) | **Client** | Require React context/hooks. |
| Auth forms (login/register/verify) | **Client** | Form state, mutations, Axios. |
| Files list/details, dashboards, admin tables | **Client** | React Query, interactivity, charts, cookie-auth calls from browser. |
| Guards (`layout.tsx` in protected/admin) | **Client** | Read auth state, redirect. |

Rationale: because auth is a browser httpOnly cookie and data is user-specific and interactive, data-fetching components are Client Components using React Query. Server Components are used for static structure. (A server-side session read is possible but adds cross-origin cookie forwarding complexity; MVP keeps data fetching on the client — documented trade-off.)

## 3. Providers

```
providers/
  QueryProvider.tsx     # QueryClient + Devtools (dev)
  ThemeProvider.tsx     # dark mode (P2)
  ToastProvider.tsx     # toast portal
  AuthProvider.tsx      # current-user context from GET /auth/profile
```

`AuthProvider` fetches `/auth/profile` on mount (React Query), exposes `{ user, isLoading, isAdmin }`; guards consume it.

## 4. API layer

```
lib/
  axios.ts        # axios instance: baseURL=NEXT_PUBLIC_API_URL + '/api', withCredentials:true, X-Requested-With header, response-error normaliser (-> 401 handler)
  queryClient.ts  # defaults: staleTime, retry, refetchOnWindowFocus
services/
  auth.service.ts
  files.service.ts
  users.service.ts
  stats.service.ts
```

Services wrap Axios calls and return typed data; hooks wrap services with React Query (`17`).

## 5. Hooks (reusable)

```
hooks/
  useAuth.ts            # from AuthProvider
  useFiles.ts           # list query (params)
  useFile.ts            # details query
  useUploadFiles.ts     # upload mutation + progress
  useDeleteFile.ts
  useUserStats.ts
  useAdminStats.ts
  useUsers.ts / useUpdateUserRole.ts / useDeleteUser.ts
  useAdminFiles.ts / useDeleteAnyFile.ts
  useDebounce.ts        # search input
  usePagination.ts      # page/limit state <-> URL
```

## 6. Feature modules

```
features/
  auth/        (LoginForm, RegisterForm, VerifyForm, ResendButton)
  files/       (Dropzone, UploadProgressList, FileTable/Card, FileFilters, FileDetails, DeleteFileDialog)
  dashboard/   (StatCard, TypeDistributionChart, UploadHistoryChart, StorageGauge)
  admin/       (UsersTable, RoleSelect, DeleteUserDialog, AdminFilesTable, AdminStats)
```

## 7. Reusable UI components

```
components/ui/
  Button, Input, Label, Select, Card, Badge, Table, Dialog/Modal,
  Toast, Spinner, Skeleton, EmptyState, ErrorState, Pagination, ProgressBar, Avatar
```

Consistent, Tailwind-styled, accessible primitives reused across features.

## 8. State strategy

- **Server state:** React Query (all API data + cache/invalidation, `17`).
- **UI state:** local `useState`/`useReducer` (form fields, dialogs, dropzone).
- **URL state:** search/filter/sort/page in query string (shareable, back-button friendly).
- **Auth state:** `AuthProvider` (derived from `/auth/profile`).
- No Redux/Zustand needed (YAGNI).

## 9. Loading / empty / error / toast (NFR-006)

| State | Pattern |
|---|---|
| Loading | `<Skeleton>` rows / spinner; disabled controls. |
| Empty | `<EmptyState>` with CTA (e.g. "Upload your first file"). |
| Error | `<ErrorState>` with retry; route `error.tsx` boundary for crashes. |
| Feedback | `<Toast>` on mutation success/error. |
| 401 | Axios interceptor → clear cache → redirect `/login`. |

## 10. Animations (Framer Motion)

- Page/section transitions, list item enter/exit, dialog scale/fade, progress bar.
- Respect `prefers-reduced-motion` (NFR-008, P2).
- Keep subtle; no layout-blocking animation.

## 11. Responsive & accessibility

- Tailwind breakpoints; tables → cards on mobile; touch-friendly dropzone.
- Semantic elements, labelled inputs, focus-visible, dialog focus trap, AA contrast (`06`).

## 12. Config

```
NEXT_PUBLIC_API_URL   # backend origin; client appends '/api'
```

Only public vars exposed to the browser (`25`).
