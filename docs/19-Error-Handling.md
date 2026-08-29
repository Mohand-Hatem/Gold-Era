# 19 — Error Handling

Consistent error strategy across backend and frontend. Envelope per ADR-025.

## 1. API error object

```json
{
  "success": false,
  "error": {
    "code": "ERR_CODE",
    "message": "Human-readable, safe to display",
    "details": [ { "field": "email", "message": "..." } ]
  }
}
```

- `code`: stable machine string (below).
- `message`: user-safe; never leaks stack/SQL/secret.
- `details`: optional, mainly validation.

## 2. Error code catalogue

| Code | HTTP | Meaning | Category |
|---|---|---|---|
| `ERR_VALIDATION` | 400 | Input failed schema | Validation |
| `ERR_UNAUTHENTICATED` | 401 | Missing/invalid/expired token | Auth |
| `ERR_INVALID_CREDENTIALS` | 401 | Bad email/password (generic) | Auth |
| `ERR_EMAIL_NOT_VERIFIED` | 403 | Login before verification | Auth |
| `ERR_FORBIDDEN` | 403 | Role/ownership denied | Authz |
| `ERR_SELF_DELETE` | 403 | Admin deleting self | Authz |
| `ERR_SELF_DEMOTE` | 403 | Admin demoting self | Authz |
| `ERR_USER_NOT_FOUND` | 404 | No such user | NotFound |
| `ERR_FILE_NOT_FOUND` | 404 | No such file | NotFound |
| `ERR_NOT_FOUND` | 404 | Unknown route/resource | NotFound |
| `ERR_EMAIL_TAKEN` | 409 | Duplicate email | Conflict |
| `ERR_ALREADY_VERIFIED` | 409 | Resend on verified account | Conflict |
| `ERR_OTP_INVALID` | 400 | Wrong OTP | OTP |
| `ERR_OTP_EXPIRED` | 400 | OTP past expiry | OTP |
| `ERR_OTP_ATTEMPTS` | 429 | >5 verify attempts | OTP |
| `ERR_OTP_COOLDOWN` | 429 | Resend within 60s | OTP |
| `ERR_OTP_RESEND_LIMIT` | 429 | >5 resends/hour | OTP |
| `ERR_FILE_TOO_LARGE` | 413 | File/request over limit | Upload |
| `ERR_UNSUPPORTED_TYPE` | 415 | Type not allowed / spoofed | Upload |
| `ERR_UPLOAD_FAILED` | 400 | Generic upload failure | Upload |
| `ERR_RATE_LIMITED` | 429 | Too many requests | RateLimit |
| `ERR_INTERNAL` | 500 | Unexpected | Server |

## 3. Backend handling

- Services throw `AppError(code, status, message, details?)`.
- Async controllers wrapped by `asyncHandler` → forward to `errorHandler`.
- Known Prisma errors mapped: `P2002` (unique) → `ERR_EMAIL_TAKEN`/conflict; `P2025` (not found) → 404.
- Multer errors mapped: `LIMIT_FILE_SIZE` → `ERR_FILE_TOO_LARGE`; `LIMIT_FILE_COUNT` → `ERR_VALIDATION`.
- `errorHandler`:
  1. If `AppError` → use its code/status/message.
  2. Else if known library error → map.
  3. Else → 500 `ERR_INTERNAL`, generic message, **log full stack** (NFR-011).
- `notFound` middleware → 404 `ERR_NOT_FOUND` for unmatched routes.

```mermaid
flowchart TD
  T[throw / next(err)] --> H[errorHandler]
  H --> K{AppError?}
  K -->|yes| ENV[envelope with code/status]
  K -->|no| L{known lib error?}
  L -->|yes| MAP[map to code/status]
  L -->|no| I[500 ERR_INTERNAL + log stack]
  ENV --> RES[JSON error envelope]
  MAP --> RES
  I --> RES
```

## 4. Frontend handling per category

| Category | UX |
|---|---|
| Validation (400) | inline field errors from `details`; keep form. |
| Unauthenticated (401) | Axios interceptor: clear cache → redirect `/login?redirect=`. |
| Forbidden (403) | toast "You don't have access"; on admin route → redirect `/dashboard`. |
| Not found (404) | resource page → not-found state; route → `not-found.tsx`. |
| Conflict (409) | inline (e.g. "email already registered"). |
| OTP errors | contextual message near OTP field; offer resend on expired/attempts. |
| Upload (413/415) | per-file toast/list with reason; keep valid files. |
| Rate limited (429) | toast "Too many attempts, try later" + retry-after hint. |
| Internal (500) | toast "Something went wrong"; retry button; no technical detail. |

## 5. Axios normaliser

Interceptor converts any error into `{ status, code, message, details }` from the envelope, with fallbacks for network/timeout (`code: 'ERR_NETWORK'`, friendly message). React Query consumes this shape (`17`).

## 6. Global boundaries

- Next.js `app/error.tsx` (route error boundary) and `not-found.tsx`.
- Backend: `process` unhandledRejection/uncaughtException logged; server stays resilient via per-request try/catch.

## 7. Logging

- Errors log `method path status code ms` + stack for 500s.
- Client never receives stack/SQL. (NFR-011, `20`)

## 8. Priority

Envelope, `errorHandler`, `notFound`, Axios normaliser, 401 redirect, validation/upload/auth mapping: **P0**. Retry-after headers, structured JSON logs: **P1**.
