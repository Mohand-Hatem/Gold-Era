# 11 — API Specification

**Canonical REST contract.** All request/response shapes derive from here. Envelope per ADR-025; base path `/api` per ADR-027; cookie auth per ADR-008.

## 1. Conventions

### Base URL

```
Production:  https://<backend-host>/api
Local:       http://localhost:8080/api
```

`/health` is mounted at the root (not under `/api`).

### Response envelope

Success:

```json
{ "success": true, "data": { }, "meta": { } }
```

`meta` present only for paginated lists.

Error (see `19` for full code list):

```json
{ "success": false, "error": { "code": "ERR_CODE", "message": "Human readable", "details": [ ] } }
```

### Authentication

- JWT is sent automatically as the `access_token` httpOnly cookie (ADR-008).
- Clients set `withCredentials: true`; state-changing requests also send `X-Requested-With: fetch` (ADR-021).
- A `Authorization: Bearer <token>` header is accepted as a fallback (used by API tests).

### Authorization levels

| Level | Meaning |
|---|---|
| Public | No auth. |
| User | Valid JWT, `isEmailVerified = true`. |
| Admin | Valid JWT, `role = ADMIN`. |
| Owner/Admin | Resource owner or admin. |

### Common status codes

| Code | Use |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (role/ownership) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 413 | Payload too large |
| 415 | Unsupported media type |
| 429 | Rate limited |
| 500 | Unexpected |

### Pagination / filter / sort query params (ADR-012, ADR-024)

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int ≥1 | 1 | |
| `limit` | int 1–100 | 10 | |
| `search` | string | — | case-insensitive contains |
| `category` | enum | — | DOCUMENT/IMAGE/TEXT/OTHER |
| `mimeType` | string | — | exact |
| `sortBy` | enum | createdAt | createdAt/size/originalName (files); createdAt/name/email (users) |
| `sortOrder` | enum | desc | asc/desc |

Pagination meta:

```json
"meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
```

---

## 2. Health

### GET /health — Public

Response 200:

```json
{ "status": "ok", "uptime": 1234.5, "timestamp": "2026-01-01T00:00:00.000Z" }
```

(Not wrapped in the standard envelope; infra endpoint.)

---

## 3. Auth module (`/api/auth`)

### POST /auth/register — Public

Body:

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Secret123" }
```

Validation: name 1–100; email valid+unique; password ≥8, ≥1 letter+1 number (`18`).

Success 201:

```json
{ "success": true, "data": { "userId": "cuid", "email": "jane@example.com", "message": "Verification code sent" } }
```

Errors: 400 `ERR_VALIDATION`; 409 `ERR_EMAIL_TAKEN`.

Side effects: creates user (`isEmailVerified=false`), generates OTP, emails it (AUTH-001/002).

---

### POST /auth/verify-email — Public

Body:

```json
{ "email": "jane@example.com", "code": "123456" }
```

Success 200:

```json
{ "success": true, "data": { "message": "Email verified. You can now log in." } }
```

Errors: 400 `ERR_VALIDATION`; 400 `ERR_OTP_INVALID`; 400 `ERR_OTP_EXPIRED`; 429 `ERR_OTP_ATTEMPTS`; 404 `ERR_USER_NOT_FOUND`.

Behaviour: compares against latest active code; increments `attempts` on mismatch; blocks after 5 (AUTH-003/012).

---

### POST /auth/resend-code — Public

Body: `{ "email": "jane@example.com" }`

Success 200: `{ "success": true, "data": { "message": "Verification code sent" } }`

Errors: 404 `ERR_USER_NOT_FOUND`; 409 `ERR_ALREADY_VERIFIED`; 429 `ERR_OTP_COOLDOWN` (within 60s); 429 `ERR_OTP_RESEND_LIMIT` (>5/hour).

Note: to avoid user enumeration, may return a generic success even for unknown emails (see `20`); MVP returns 404 for developer clarity — flagged as a security trade-off.

---

### POST /auth/login — Public

Body: `{ "email": "jane@example.com", "password": "Secret123" }`

Success 200 — sets `access_token` httpOnly cookie:

```json
{ "success": true, "data": { "user": { "id": "cuid", "name": "Jane Doe", "email": "jane@example.com", "role": "USER", "isEmailVerified": true, "createdAt": "..." } } }
```

Errors: 400 `ERR_VALIDATION`; 401 `ERR_INVALID_CREDENTIALS`; 403 `ERR_EMAIL_NOT_VERIFIED`.

Cookie attributes: `HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`.

---

### POST /auth/logout — Public (ADR-036)

Clears the cookie. Success 200: `{ "success": true, "data": { "message": "Logged out" } }`.

> Originally specified as authenticated. Changed to public and idempotent during Phase 4: requiring a valid token means an expired session can never clear its cookie, leaving the browser to keep sending a stale one. Clearing a cookie the caller already holds grants no capability.

---

### GET /auth/profile — User

Success 200:

```json
{ "success": true, "data": { "id": "cuid", "name": "Jane Doe", "email": "jane@example.com", "role": "USER", "isEmailVerified": true, "createdAt": "...", "updatedAt": "..." } }
```

Errors: 401 `ERR_UNAUTHENTICATED`.

---

## 4. Users module (`/api/users`) — Admin

### GET /users — Admin

Query: `page, limit, search, sortBy(createdAt|name|email), sortOrder`.

Success 200:

```json
{
  "success": true,
  "data": [
    { "id": "cuid", "name": "Jane", "email": "jane@example.com", "role": "USER", "isEmailVerified": true, "createdAt": "...", "_count": { "files": 3 } }
  ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

Errors: 401; 403 `ERR_FORBIDDEN`.

---

### PATCH /users/:id — Admin

Body: `{ "role": "ADMIN" }` (only `role` mutable in MVP; USER-004).

Success 200: updated user object.

Errors: 400 `ERR_VALIDATION`; 401; 403; 404 `ERR_USER_NOT_FOUND`; 403 `ERR_SELF_DEMOTE` (admin demoting self, ADR-020).

Side effect: bumps target `tokenVersion` to invalidate their sessions (AUTH-013).

---

### DELETE /users/:id — Admin

Success 200: `{ "success": true, "data": { "message": "User deleted" } }`.

Errors: 401; 403; 404 `ERR_USER_NOT_FOUND`; 403 `ERR_SELF_DELETE` (ADR-020).

Side effects: cascade delete files + codes; remove owned blobs (ADR-013).

---

## 5. Files module (`/api/files`)

### POST /files/upload — User

`Content-Type: multipart/form-data`; field `files` (1–5 files). Limits: 10MB/file, 50MB/request (ADR-002).

Success 201:

```json
{
  "success": true,
  "data": {
    "uploaded": [ { "id": "cuid", "originalName": "report.pdf", "mimeType": "application/pdf", "category": "DOCUMENT", "size": 20480, "extractionStatus": "DONE", "createdAt": "..." } ],
    "failed": [ { "originalName": "bad.exe", "reason": "ERR_UNSUPPORTED_TYPE" } ]
  }
}
```

Errors: 400 `ERR_VALIDATION` (no files); 413 `ERR_FILE_TOO_LARGE`; 415 `ERR_UNSUPPORTED_TYPE` (if entire request invalid); 401.

Behaviour: per-file validation; valid files stored + metadata persisted + extraction attempted; invalid files reported in `failed[]` without aborting the batch (partial success). If **all** fail, return 400/415 with details.

---

### GET /files — User

Lists the **caller's own** files. Query: `page, limit, search, category, mimeType, sortBy(createdAt|size|originalName), sortOrder`.

Search matches `originalName` and (optionally) `extractedContent` (ADR-024).

Success 200: paginated list of file summaries (no `extractedContent` body in list; only in details).

```json
{
  "success": true,
  "data": [ { "id": "cuid", "originalName": "report.pdf", "mimeType": "application/pdf", "category": "DOCUMENT", "size": 20480, "extractionStatus": "DONE", "createdAt": "..." } ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

Admin variant: `GET /files?scope=all` (Admin only) lists across all users and includes `owner { id, name, email }` (ADMIN-002). Non-admins passing `scope=all` are ignored (scoped to self) — not an error.

---

### GET /files/:id — Owner/Admin

Success 200 — full record including `extractedContent`:

```json
{
  "success": true,
  "data": {
    "id": "cuid", "originalName": "report.pdf", "mimeType": "application/pdf",
    "category": "DOCUMENT", "extension": "pdf", "size": 20480, "checksum": "sha256hex",
    "extractionStatus": "DONE", "extractedContent": "Lorem ipsum...",
    "owner": { "id": "cuid", "name": "Jane" },
    "createdAt": "...", "updatedAt": "..."
  }
}
```

Errors: 401; 403 `ERR_FORBIDDEN` (not owner and not admin, FILE-015); 404 `ERR_FILE_NOT_FOUND`.

---

### GET /files/:id/download — Owner/Admin (P1, ADR-023)

Query: `disposition=inline|attachment` (default inline). Streams the blob with correct `Content-Type`. Used for image/text preview and download bonus.

Errors: 401; 403; 404.

---

### DELETE /files/:id — Owner/Admin

Success 200: `{ "success": true, "data": { "message": "File deleted" } }`.

Errors: 401; 403 `ERR_FORBIDDEN`; 404 `ERR_FILE_NOT_FOUND`.

Side effect: removes row + blob (ADR-013).

---

## 6. Statistics module (`/api/stats`)

### GET /stats/user — User

Success 200 (shapes fixed by `21`):

```json
{
  "success": true,
  "data": {
    "totalFiles": 12,
    "storageUsedBytes": 543210,
    "typeDistribution": [ { "category": "DOCUMENT", "count": 5 }, { "category": "IMAGE", "count": 7 } ],
    "uploadHistory": [ { "date": "2026-01-01", "count": 2 } ]
  }
}
```

Errors: 401.

---

### GET /stats/admin — Admin

Success 200:

```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalFiles": 340,
    "storageUsedBytes": 123456789,
    "topFileTypes": [ { "category": "IMAGE", "count": 180 }, { "category": "DOCUMENT", "count": 120 } ],
    "recentUploads": [ { "id": "cuid", "originalName": "a.png", "size": 2048, "createdAt": "...", "owner": { "id": "cuid", "name": "Jane" } } ]
  }
}
```

Errors: 401; 403.

---

## 7. Endpoint summary

| Method | Path | Auth | Requirements |
|---|---|---|---|
| GET | /health | Public | SYS-005 |
| POST | /auth/register | Public | AUTH-001/002 |
| POST | /auth/verify-email | Public | AUTH-003/012 |
| POST | /auth/resend-code | Public | AUTH-004 |
| POST | /auth/login | Public | AUTH-005/006/007 |
| POST | /auth/logout | Public (ADR-036) | AUTH-011 |
| GET | /auth/profile | User | AUTH-008 |
| GET | /users | Admin | USER-002/003 |
| PATCH | /users/:id | Admin | USER-004/006 |
| DELETE | /users/:id | Admin | USER-005/006 |
| POST | /files/upload | User | FILE-001..009 |
| GET | /files | User/Admin | FILE-010..013, ADMIN-002 |
| GET | /files/:id | Owner/Admin | FILE-014/015 |
| GET | /files/:id/download | Owner/Admin | FILE-017/018 |
| DELETE | /files/:id | Owner/Admin | FILE-016, ADMIN-003 |
| GET | /stats/user | User | STAT-001 |
| GET | /stats/admin | Admin | STAT-003 |

## 8. Security considerations per endpoint

- All non-public endpoints run through auth middleware → RBAC middleware → ownership check (files).
- Upload endpoint: Multer limits + `fileFilter` + post-write magic-byte check; cleanup on rejection (`13`, `20`).
- List endpoints: sort field whitelisting prevents injection; `limit` capped at 100.
- User enumeration minimised on auth errors (generic messages) (`20`).
- Rate limiting (P1) on `/auth/*` and `/files/upload` (SYS-004).
