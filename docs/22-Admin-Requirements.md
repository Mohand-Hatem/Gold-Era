# 22 — Admin Requirements

Admin surface specification. Backend RBAC is the boundary; FE guards are UX (`08`). Endpoints in `11`.

## 1. Admin authentication & authorization

- Admin logs in through the same `/auth/login` (ADR-019 seeds the admin).
- Every `/users/*`, `/files?scope=all`, `/stats/admin` request passes `authenticate` → `authorizeRole('ADMIN')`.
- Non-admin → 403 `ERR_FORBIDDEN` regardless of frontend.

## 2. User management

### 2.1 Users listing (USER-002)

- `GET /users?page&limit&search&sortBy&sortOrder`.
- Returns user summaries incl. `role`, `isEmailVerified`, `_count.files`, `createdAt`; paginated meta.

### 2.2 User search (USER-003)

- `search` → case-insensitive contains on `name` OR `email`.

### 2.3 Role editing (USER-004)

- `PATCH /users/:id { role }`. Only `role` mutable.
- On success bumps target `tokenVersion` (invalidates their sessions, AUTH-013).
- **Guard:** admin cannot demote self → 403 `ERR_SELF_DEMOTE` (ADR-020).

### 2.4 User deletion (USER-005)

- `DELETE /users/:id`. Cascade deletes files + verification codes; service removes owned blobs (ADR-013).
- **Guard:** admin cannot delete self → 403 `ERR_SELF_DELETE`.

## 3. Files management

### 3.1 Files listing (ADMIN-002)

- `GET /files?scope=all&page&limit&search&category&mimeType&sortBy&sortOrder`.
- Includes `owner { id, name, email }` column. Non-admins passing `scope=all` are silently scoped to self.

### 3.2 File search / filter / pagination

- Same semantics as user files (ADR-024): search on `originalName`, filter by `category`/`mimeType`, sort by `createdAt`/`size`/`originalName`, paginated.

### 3.3 File deletion (ADMIN-003)

- `DELETE /files/:id` — admin may delete any file (ownership bypass). Removes row + blob.

## 4. Admin dashboard / statistics (STAT-003/004)

- `GET /stats/admin` → total users, total files, storage used, top file types, recent uploads (`21`).
- Rendered as stat cards + charts (Recharts) + recent-uploads table.

## 5. Recent uploads (ADMIN-004)

- Latest 10 files across all users with owner name, size, date; part of admin stats payload.

## 6. Dangerous operations & confirmation (ADMIN-005)

| Operation | Risk | UI requirement |
|---|---|---|
| Delete user | Irreversible; cascades files | Confirm dialog naming the user + "this deletes their files". |
| Delete file | Irreversible | Confirm dialog naming the file. |
| Change role → ADMIN | Grants full access | Confirm dialog. |
| Change role → USER | Removes access | Confirm dialog. |
| Self delete/demote | Lockout | Blocked server-side; UI hides/disables the option for self. |

All destructive mutations require an explicit confirm step; on success show a toast and invalidate relevant queries (`17`).

## 7. Admin frontend routes

| Route | Purpose |
|---|---|
| `/admin` | dashboard (stats) |
| `/admin/users` | user management table |
| `/admin/files` | all-files management table |

Guarded by `(admin)/layout.tsx` (role check → redirect non-admins).

## 8. Requirement mapping

| Feature | SRS |
|---|---|
| Admin auth/authz | AUTH-010, ADMIN-001 |
| Users list/search | USER-002/003 |
| Role edit | USER-004 |
| User delete | USER-005 |
| Self-protection | USER-006, ADR-020 |
| All files list/search/filter/paginate | ADMIN-002 |
| Delete any file | ADMIN-003 |
| Admin stats | STAT-003/004 |
| Recent uploads | ADMIN-004 |
| Confirmations | ADMIN-005 |
