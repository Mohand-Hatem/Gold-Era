# 02 — Software Requirements Specification (SRS)

This document is the **canonical requirement ID registry**. Every requirement has a unique ID used across all other documents and the traceability matrix (`31`). Priorities follow `00-INDEX.md` (P0/P1/P2/P3). Decisions referenced as `ADR-xxx` live in `30`.

## 1. System overview

Managing Your Files is a modular-monolith full-stack web application. A Next.js (App Router) client consumes a REST API served by an Express + TypeScript backend, which persists data in PostgreSQL through Prisma. Authenticated users upload, browse and manage their own files and view personal statistics. Administrators manage all users and files and view system-wide statistics. Authentication uses email/password with OTP email verification and JWT delivered via an httpOnly cookie (ADR-008).

## 2. Actors

| Actor | Description | Auth state |
|---|---|---|
| **Guest** | Unauthenticated visitor. | None |
| **User** | Registered, email-verified account with `role = USER`. | JWT cookie |
| **Admin** | Account with `role = ADMIN`. Superset of user abilities plus admin surface. | JWT cookie |
| **System** | Background/derived work: OTP generation, email dispatch, content extraction, statistics aggregation. | n/a |

## 3. System constraints

| ID | Constraint |
|---|---|
| CON-01 | Frontend stack fixed: Next.js App Router, TypeScript, Tailwind, Framer Motion, TanStack React Query, Axios. |
| CON-02 | Backend stack fixed: Express, TypeScript, Prisma, PostgreSQL/MySQL (→ PostgreSQL, ADR-001), JWT, Multer. |
| CON-03 | Effort budget 8–10 hours; scope prioritised P0 first. |
| CON-04 | Modular monolith; no microservices. |
| CON-05 | Backend is the authoritative security boundary; frontend guards are UX only. |
| CON-06 | Deployables: frontend (Vercel), backend (Render/Railway/Fly), managed PostgreSQL. |

## 4. Dependencies

| Area | Dependency |
|---|---|
| Runtime | Node.js 20+ |
| DB | PostgreSQL 16, Prisma Client |
| Auth | jsonwebtoken, bcrypt |
| Uploads | multer, file-type |
| Extraction | pdf-parse, mammoth (docx) |
| Email | nodemailer (Gmail SMTP app password) |
| Validation | zod |
| Frontend data | @tanstack/react-query, axios |
| Charts | recharts (ADR-014) |
| Animation | framer-motion |

## 5. Interfaces

| Interface | Description |
|---|---|
| REST API | JSON over HTTPS under `/api` (ADR-027); multipart for uploads. Envelope per ADR-025. |
| Email | Outbound SMTP for OTP delivery. |
| Browser | Responsive web UI, cookie-based session. |
| Blob storage | Cloudinary via `StorageService` (ADR-039). |

---

## 6. Functional requirements

Priority key: P0 mandatory · P1 important · P2 bonus · P3 out of scope.

### 6.1 Authentication & Authorization (AUTH)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-001 | A guest can register with name, email, password. Passwords are bcrypt-hashed (ADR-018). Email must be unique. | P0 |
| AUTH-002 | On registration the system generates a 6-digit OTP, stores it hashed, and emails it (ADR-010, ADR-011). | P0 |
| AUTH-003 | A user verifies email by submitting a valid, unexpired OTP; account becomes `isEmailVerified = true`. | P0 |
| AUTH-004 | A user can request a new OTP subject to cooldown (60s) and hourly cap (5) (ADR-010). | P0 |
| AUTH-005 | A verified user can log in with email + password and receives a JWT in an httpOnly cookie (ADR-007/008). | P0 |
| AUTH-006 | Login is refused for unverified accounts with a clear, actionable error. | P0 |
| AUTH-007 | Invalid credentials return a generic error without revealing which field failed. | P0 |
| AUTH-008 | An authenticated user can fetch their profile via `GET /auth/profile`. | P0 |
| AUTH-009 | Protected endpoints reject missing/invalid/expired tokens with 401. | P0 |
| AUTH-010 | Role-based authorization: admin-only endpoints reject non-admins with 403. | P0 |
| AUTH-011 | Logout clears the auth cookie (ADR-009). | P0 |
| AUTH-012 | OTP verification enforces a max of 5 attempts per active code (ADR-010). | P0 |
| AUTH-013 | `tokenVersion` in the JWT allows server-side invalidation on role change/delete (ADR-007). | P1 |
| AUTH-014 | CSRF mitigation for cookie auth: custom header + strict CORS (ADR-021). | P1 |
| AUTH-015 | Refresh-token rotation. | P2 |

### 6.2 User profile & user administration (USER)

| ID | Requirement | Priority |
|---|---|---|
| USER-001 | An authenticated user can view their own profile (name, email, role, verified status, joined date). | P0 |
| USER-002 | Admin can list users with search and pagination (`GET /users`). | P0 |
| USER-003 | Admin can search users by name/email (case-insensitive contains). | P0 |
| USER-004 | Admin can change a user's role between USER and ADMIN (`PATCH /users/:id`). | P0 |
| USER-005 | Admin can delete a user (`DELETE /users/:id`), cascading their files and codes (ADR-013). | P0 |
| USER-006 | Admin cannot delete or demote themselves (ADR-020). | P0 |
| USER-007 | User can update own profile name. | P2 |
| USER-008 | User can change own password. | P2 |

### 6.3 File management (FILE)

| ID | Requirement | Priority |
|---|---|---|
| FILE-001 | Authenticated user can upload one or more files via multipart (`POST /files/upload`) (ADR-002). | P0 |
| FILE-002 | Multiple-file upload in a single request (max 5) is supported. | P0 |
| FILE-003 | Drag-and-drop upload in the UI. | P0 |
| FILE-004 | Upload progress indicator (Axios `onUploadProgress`). | P0 |
| FILE-005 | Client-side file validation (type, size, count) before upload. | P0 |
| FILE-006 | Server-side authoritative validation: extension + MIME + magic bytes + size (ADR-003). | P0 |
| FILE-007 | On upload, metadata is persisted: originalName, mimeType, category, size, checksum, storage key, timestamps (ADR-015/016). | P0 |
| FILE-008 | Text content is extracted for supported types and stored (≤20k chars) (ADR-005). | P0 |
| FILE-009 | Extraction failure does not fail upload; `extractionStatus=FAILED` (ADR-006). | P0 |
| FILE-010 | User can list their own files (`GET /files`) with pagination. | P0 |
| FILE-011 | File list supports keyword search (ADR-024). | P0 |
| FILE-012 | File list supports filtering by type/category (ADR-024). | P0 |
| FILE-013 | File list supports sorting by date/size/name (ADR-024). | P0 |
| FILE-014 | User can view a single file's details (`GET /files/:id`) including extracted content. | P0 |
| FILE-015 | Ownership enforced: a user can only read/delete their own files; admin can access any. | P0 |
| FILE-016 | User can delete their own file (`DELETE /files/:id`); blob is removed (ADR-013). | P0 |
| FILE-017 | Authenticated download/preview stream (`GET /files/:id/download`) (ADR-023). | P1 |
| FILE-018 | Image and text preview in the details view. | P1 |
| FILE-019 | Soft delete. | P2 |
| FILE-020 | Folder management. | P2 |
| FILE-021 | Duplicate detection acted upon (dedupe UI). | P2 |

### 6.4 Statistics (STAT)

| ID | Requirement | Priority |
|---|---|---|
| STAT-001 | `GET /stats/user` returns the current user's stats: total files, storage used, type distribution, upload history. | P0 |
| STAT-002 | User dashboard renders total files, storage usage, file-type chart, upload-history chart (Recharts). | P0 |
| STAT-003 | `GET /stats/admin` returns system stats: total users, total files, storage used, top file types, recent uploads. | P0 |
| STAT-004 | Admin dashboard renders the admin stats with charts and a recent-uploads list. | P0 |
| STAT-005 | Upload history is bucketed by day for a trailing window (default 30 days) (see `21`). | P0 |

### 6.5 Admin surface (ADMIN)

| ID | Requirement | Priority |
|---|---|---|
| ADMIN-001 | Admin-only pages are gated by frontend guards (UX) and backend RBAC (security). | P0 |
| ADMIN-002 | Admin can view all files across users with search, filter, pagination (`GET /files?scope=all` or admin route — see `11`). | P0 |
| ADMIN-003 | Admin can delete any file. | P0 |
| ADMIN-004 | Admin dashboard shows recent uploads (latest N with owner). | P0 |
| ADMIN-005 | Dangerous admin actions (delete user, delete file, change role) require UI confirmation. | P0 |
| ADMIN-006 | Audit logs of admin actions. | P2 |

### 6.6 Cross-cutting platform (SYS)

| ID | Requirement | Priority |
|---|---|---|
| SYS-001 | Consistent API response/error envelope (ADR-025). | P0 |
| SYS-002 | Centralised error-handling middleware maps errors to codes/status (`19`). | P0 |
| SYS-003 | CORS restricted to known origins with credentials (ADR-008). | P0 |
| SYS-004 | Rate limiting on auth + upload endpoints. | P1 |
| SYS-005 | `GET /health` liveness endpoint (ADR-026). | P1 |
| SYS-006 | Request logging / structured logs. | P1 |
| SYS-007 | Docker support. | P2 |

---

## 7. Non-functional requirements

Full detail and targets in `06`. IDs are canonical here.

| ID | Category | Requirement | Priority |
|---|---|---|---|
| NFR-001 | Security | Passwords hashed with bcrypt cost 12; secrets only in env. | P0 |
| NFR-002 | Security | JWT via httpOnly Secure SameSite=None cookie; auth on all protected routes. | P0 |
| NFR-003 | Security | File validation defends against MIME spoofing and path traversal. | P0 |
| NFR-004 | Performance | Typical API reads respond < 300 ms at assessment data volumes. | P1 |
| NFR-005 | Performance | List endpoints paginated; indexed queries avoid full scans. | P0 |
| NFR-006 | Usability | Loading, empty, and error states on every async view; toasts for feedback. | P0 |
| NFR-007 | Responsiveness | Layouts work on mobile, tablet, desktop. | P0 |
| NFR-008 | Accessibility | Semantic HTML, labels, keyboard focus, contrast. | P1 |
| NFR-009 | Maintainability | Layered modular monolith; typed end to end; reusable components/hooks. | P0 |
| NFR-010 | Reliability | Upload is transactional w.r.t. DB/blob consistency; failure cleanup. | P0 |
| NFR-011 | Observability | Structured logs, health check. | P1 |
| NFR-012 | Data integrity | FK constraints, cascade deletes, unique email. | P0 |
| NFR-013 | Availability | Stateless API; suitable for single managed dyno. | P1 |

## 8. Data requirements

Entities (full design in `09`): **User**, **VerificationCode**, **File**. Key rules:

- `User.email` unique; `User.role` enum(USER, ADMIN); `User.isEmailVerified` boolean.
- `VerificationCode` belongs to a user; hashed code, `expiresAt`, `attempts`, consumption flag.
- `File` belongs to a user (owner); stores metadata, checksum, storage key, extracted content, extraction status.
- Deletion of a `User` cascades to `File` and `VerificationCode` (ADR-013).

## 9. Requirement counts (scope snapshot)

| Group | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| AUTH | 12 | 2 | 1 | 0 |
| USER | 6 | 0 | 2 | 0 |
| FILE | 16 | 2 | 3 | 0 |
| STAT | 5 | 0 | 0 | 0 |
| ADMIN | 5 | 0 | 1 | 0 |
| SYS | 3 | 3 | 1 | 0 |
| NFR | 8 | 5 | 0 | 0 |

P0 total defines the MVP (see `01` §MVP and `31`).
