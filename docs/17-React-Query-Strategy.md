# 17 — TanStack React Query Strategy

Server-state management for the client. Covers query keys, caching, invalidation, pagination, mutations, and error/loading handling. API shapes in `11`; hooks live in `client/hooks` (`14`/`16`).

## 1. QueryClient defaults

```
staleTime:        30_000        # 30s: most lists/stats tolerate brief staleness
gcTime:           5 * 60_000    # 5 min cache retention
retry:            1             # one retry on transient failure
retryOnMount:     true
refetchOnWindowFocus: false     # avoid noisy refetch during assessment demo
```

Auth-sensitive queries (`profile`) may use `staleTime: 0` when correctness matters more than chattiness.

## 2. Query key conventions

Structured, hierarchical keys enable targeted invalidation:

| Data | Key |
|---|---|
| Current user profile | `['auth','profile']` |
| User files (list) | `['files', { page, limit, search, category, mimeType, sortBy, sortOrder }]` |
| File details | `['files', id]` |
| User stats | `['stats','user']` |
| Admin users list | `['admin','users', { page, limit, search, sortBy, sortOrder }]` |
| Admin files list | `['admin','files', { page, limit, search, category, sortBy, sortOrder }]` |
| Admin stats | `['stats','admin']` |

Rule: list params are part of the key so each filter/sort/page combination caches independently.

## 3. Queries

| Hook | Key | Endpoint | Notes |
|---|---|---|---|
| `useAuth` | `['auth','profile']` | GET /auth/profile | seeds AuthProvider; `enabled` always; 401 → unauth. |
| `useFiles(params)` | `['files',params]` | GET /files | `keepPreviousData` for smooth pagination. |
| `useFile(id)` | `['files',id]` | GET /files/:id | `enabled: !!id`. |
| `useUserStats` | `['stats','user']` | GET /stats/user | dashboard. |
| `useUsers(params)` | `['admin','users',params]` | GET /users | admin; `keepPreviousData`. |
| `useAdminFiles(params)` | `['admin','files',params]` | GET /files?scope=all | admin. |
| `useAdminStats` | `['stats','admin']` | GET /stats/admin | admin. |

## 4. Mutations & invalidation

| Hook | Endpoint | On success invalidate |
|---|---|---|
| `useRegister` | POST /auth/register | — (navigate to verify) |
| `useVerifyEmail` | POST /auth/verify-email | — (navigate to login) |
| `useResendCode` | POST /auth/resend-code | — (toast) |
| `useLogin` | POST /auth/login | `['auth','profile']` (refetch) |
| `useLogout` | POST /auth/logout | `queryClient.clear()` |
| `useUploadFiles` | POST /files/upload | `['files']`, `['stats','user']`, `['stats','admin']`* |
| `useDeleteFile` | DELETE /files/:id | `['files']`, `['files',id]` remove, `['stats','user']` |
| `useUpdateUserRole` | PATCH /users/:id | `['admin','users']` |
| `useDeleteUser` | DELETE /users/:id | `['admin','users']`, `['stats','admin']`, `['admin','files']` |
| `useDeleteAnyFile` | DELETE /files/:id | `['admin','files']`, `['stats','admin']` |

\* admin stats invalidated only in admin context.

Invalidation uses **prefix matching**: `invalidateQueries({ queryKey: ['files'] })` refreshes every files list variant.

## 5. Pagination strategy (ADR-012)

- Offset pagination; params in the query key + URL.
- `keepPreviousData: true` (a.k.a. `placeholderData: keepPreviousData`) so the table doesn't flash empty on page change.
- Page controls read `meta.totalPages`.

## 6. Upload mutation lifecycle (FILE-004)

```
onMutate:   set uploading UI state
mutationFn: axios.post(..., { onUploadProgress -> setProgress })
onSuccess:  toast(uploaded/failed summary); invalidate files + user stats
onError:    toast(error.message from envelope)
onSettled:  clear progress/uploading state
```

Progress is component-local state fed by Axios `onUploadProgress`, not React Query cache.

## 7. Error handling

- Axios interceptor normalises the error envelope → `{ code, message, details }` (`19`).
- `401` → interceptor clears cache + redirects `/login`; queries do not retry auth failures (`retry: (count, err) => err.status !== 401 && err.status !== 403 && count < 1`).
- Mutation errors surface via `onError` toasts.
- Query errors render `<ErrorState>` with a `refetch` retry button.

## 8. Loading handling

- `isPending`/`isLoading` → `<Skeleton>`.
- `isFetching` (background) → subtle inline spinner without blocking content.
- `keepPreviousData` avoids full reload on param change.

## 9. Cache-clearing events

| Event | Action |
|---|---|
| Login | invalidate profile. |
| Logout | `queryClient.clear()`. |
| 401 interceptor | `queryClient.clear()` + redirect. |
| Role change (self, rare) | force re-auth. |

## 10. Devtools

React Query Devtools mounted in development only (via `QueryProvider`).
