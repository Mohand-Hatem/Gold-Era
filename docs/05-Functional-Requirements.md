# 05 — Functional Requirements

Detailed per-feature specifications. Each references its SRS ID (`02`), API (`11`), data entity (`09`), and test scenarios (`23`). Priority key per `00-INDEX.md`.

Template fields: **ID · Name · Priority · Actor · Preconditions · Main flow · Alternate/Failure · Validation · Security · Result · API · Entity · Frontend · Tests**.

---

## FR-1 Registration (AUTH-001/002)

- **Priority:** P0 · **Actor:** Guest
- **Preconditions:** Not logged in; email not already registered.
- **Main flow:** Submit name/email/password → validate → hash password (bcrypt 12) → create User (`verified=false`) → generate OTP → store hashed code → email OTP → 201.
- **Alternate/Failure:** Duplicate email → 409 `ERR_EMAIL_TAKEN`; invalid input → 400; email send failure → user created, logged, resend available.
- **Validation:** name 1–100; email format+unique; password ≥8 with letter+digit.
- **Security:** password never stored/returned in plaintext; OTP hashed; generic messaging avoids enumeration on later steps.
- **Result:** Pending-verification account + OTP email.
- **API:** POST /auth/register · **Entity:** User, VerificationCode · **Frontend:** `/register` · **Tests:** register-happy, duplicate-email, weak-password.

## FR-2 Email verification (AUTH-003/012)

- **Priority:** P0 · **Actor:** Guest (owner of email)
- **Preconditions:** Account exists, unverified; active OTP present.
- **Main flow:** Submit email+code → fetch latest active code → compare hash → check expiry+attempts → mark verified, consume code → 200.
- **Alternate/Failure:** wrong code → `ERR_OTP_INVALID` (+attempts); expired → `ERR_OTP_EXPIRED`; >5 attempts → `ERR_OTP_ATTEMPTS`.
- **Validation:** email format; code exactly 6 digits.
- **Security:** attempt cap prevents brute force; codes hashed; only latest code valid.
- **API:** POST /auth/verify-email · **Entity:** VerificationCode, User · **Frontend:** `/verify-email` · **Tests:** verify-happy, wrong-otp, expired-otp, attempts-exceeded.

## FR-3 Resend verification code (AUTH-004)

- **Priority:** P0 · **Actor:** Guest
- **Main flow:** Submit email → check not verified → check cooldown (≥60s) + hourly cap (<5) → invalidate old code → create+send new → 200.
- **Failure:** verified → `ERR_ALREADY_VERIFIED`; within cooldown → `ERR_OTP_COOLDOWN`; >5/hr → `ERR_OTP_RESEND_LIMIT`.
- **API:** POST /auth/resend-code · **Tests:** resend-happy, resend-cooldown, resend-limit.

## FR-4 Login (AUTH-005/006/007)

- **Priority:** P0 · **Actor:** Guest → User
- **Preconditions:** Verified account.
- **Main flow:** Submit email+password → bcrypt compare → sign JWT → set httpOnly cookie → 200 with user object.
- **Failure:** unverified → 403 `ERR_EMAIL_NOT_VERIFIED`; bad creds → 401 `ERR_INVALID_CREDENTIALS`.
- **Security:** generic credential error; Secure/SameSite=None cookie (ADR-008).
- **API:** POST /auth/login · **Frontend:** `/login` · **Tests:** login-happy, login-unverified, login-bad-creds.

## FR-5 Logout (AUTH-011)

- **Priority:** P0 · **Actor:** User/Admin · **Main flow:** POST /auth/logout → clear cookie → client clears cache. **Tests:** logout-clears-cookie.

## FR-6 Profile (AUTH-008, USER-001)

- **Priority:** P0 · **Actor:** User/Admin · **Main flow:** GET /auth/profile with cookie → return own profile. **Failure:** no/invalid token → 401. **Frontend:** `/profile`. **Tests:** profile-authed, profile-no-token.

## FR-7 JWT authentication & protected routes (AUTH-009)

- **Priority:** P0 · **Actor:** System/all
- **Main flow:** auth middleware reads cookie (or Bearer), verifies signature+expiry+`tokenVersion`, attaches `req.user`.
- **Failure:** missing/invalid/expired → 401 `ERR_UNAUTHENTICATED`.
- **Security:** central boundary; every non-public route uses it. **Tests:** protected-no-token, protected-expired.

## FR-8 Role-based authorization (AUTH-010, ADMIN-001)

- **Priority:** P0 · **Main flow:** RBAC middleware after auth checks `req.user.role`. Admin routes require ADMIN. **Failure:** non-admin → 403 `ERR_FORBIDDEN`. **Security:** server-authoritative; FE guard is UX only. **Tests:** rbac-user-blocked, rbac-admin-allowed.

## FR-9 File upload (FILE-001..007)

- **Priority:** P0 · **Actor:** User/Admin
- **Preconditions:** Authenticated.
- **Main flow:** multipart `files` (1–5) → Multer limits → per-file validate (ext+MIME+magic bytes+size) → store UUID blob → compute checksum → persist metadata → attempt extraction → 201 `{uploaded[], failed[]}`.
- **Alternate/Failure:** invalid file → `failed[]`; oversized → 413; all invalid → 400/415; storage error → cleanup, no orphan row.
- **Validation:** count ≤5; each ≤10MB; total ≤50MB; allowed types (ADR-002/003).
- **Security:** MIME-spoof defence, UUID filename (no path traversal), ownership set to caller.
- **API:** POST /files/upload · **Entity:** File · **Frontend:** dropzone in `/files`/`/upload` · **Tests:** upload-single, upload-multiple, upload-bad-type, upload-too-large, upload-partial.

## FR-10 Multiple upload (FILE-002)

- **Priority:** P0 · Covered by FR-9; up to 5 files/request; partial success semantics.

## FR-11 Drag & drop (FILE-003)

- **Priority:** P0 · **Actor:** User · **Frontend:** dropzone accepts drop + click-to-select; shows selected list; validates client-side before upload. **Tests (FE):** dropzone-accepts, dropzone-rejects-type.

## FR-12 Upload progress (FILE-004)

- **Priority:** P0 · **Frontend:** Axios `onUploadProgress` → per-request percentage bar; disabled controls during upload. **Tests (FE, P2):** progress-updates.

## FR-13 Client + server validation (FILE-005/006)

- **Priority:** P0 · Client validation is advisory UX; server validation authoritative (`18`). **Tests:** covered in FR-9 + validation suite.

## FR-14 My Files list (FILE-010)

- **Priority:** P0 · **Actor:** User (own) / Admin (all via scope)
- **Main flow:** GET /files with pagination → return own file summaries + meta.
- **Empty:** empty state UI. **Security:** scoped to `ownerId` unless admin `scope=all`.
- **API:** GET /files · **Frontend:** `/files` · **Tests:** list-own-only, list-pagination.

## FR-15 Search (FILE-011)

- **Priority:** P0 · `search` param → case-insensitive contains on `originalName` (+extractedContent for user) (ADR-024). Empty search = no filter. **Tests:** search-matches, search-empty.

## FR-16 Filter (FILE-012)

- **Priority:** P0 · `category` and/or `mimeType`. **Tests:** filter-category.

## FR-17 Sort (FILE-013)

- **Priority:** P0 · `sortBy` in {createdAt,size,originalName}, `sortOrder` asc/desc; default createdAt desc; invalid field ignored. **Tests:** sort-size-desc, sort-invalid-field.

## FR-18 Pagination (FILE-010, ADR-012)

- **Priority:** P0 · `page`/`limit` (default 10, max 100); meta returned; out-of-range page → empty list + meta. **Tests:** pagination-meta, pagination-out-of-range.

## FR-19 File details (FILE-014)

- **Priority:** P0 · GET /files/:id → full record incl. extractedContent. **Failure:** not owner/admin → 403; missing → 404. **Frontend:** `/files/:id`. **Tests:** details-owner, details-forbidden, details-404.

## FR-20 Content extraction (FILE-008/009, ADR-005/006)

- **Priority:** P0 (text/json), P1 (pdf/docx)
- **Main flow:** after store, route by type → extract text (≤20k) → status DONE; images/unsupported → SKIPPED; parser error → FAILED, content null; never fails upload.
- **API:** part of upload · **Entity:** File.extractedContent/extractionStatus · **Tests:** extract-txt, extract-pdf, extract-failure-nonblocking.

## FR-21 Download / preview (FILE-017/018, ADR-023)

- **Priority:** P1 · GET /files/:id/download streams blob for owner/admin; image & text preview in details. **Tests:** download-owner, download-forbidden.

## FR-22 User statistics (STAT-001/002/005)

- **Priority:** P0 · GET /stats/user → total files, storage bytes, type distribution, upload history (trailing 30 days). Dashboard renders with Recharts. Calc logic in `21`. **Frontend:** `/dashboard`. **Tests:** stats-user-totals.

## FR-23 Admin dashboard stats (STAT-003/004, ADMIN-004)

- **Priority:** P0 · GET /stats/admin → total users, total files, storage, top types, recent uploads. **Frontend:** `/admin`. **Tests:** stats-admin-totals, stats-admin-forbidden.

## FR-24 Admin user management (USER-002..006)

- **Priority:** P0 · list/search/paginate users; PATCH role; DELETE user (cascade); self-protection (ADR-020). **Frontend:** `/admin/users`. **Tests:** users-list, users-role-change, users-delete-cascade, users-self-delete-blocked, users-self-demote-blocked.

## FR-25 Admin file management (ADMIN-002/003)

- **Priority:** P0 · list all files (owner column) with search/filter/paginate; delete any file. **Frontend:** `/admin/files`. **Tests:** admin-files-list-all, admin-delete-any.

## FR-26 Dangerous-action confirmation (ADMIN-005)

- **Priority:** P0 · Delete user, delete file, change role require a confirm dialog in UI. **Tests (FE):** confirm-required.

## FR-27 Consistent API envelope & errors (SYS-001/002)

- **Priority:** P0 · All responses use the ADR-025 envelope; central error middleware maps to codes (`19`). **Tests:** error-shape.

## Feature → priority index

| FR | Feature | Priority |
|---|---|---|
| FR-1..8 | Auth & RBAC | P0 |
| FR-9..20 | Upload/list/search/filter/sort/paginate/details/extraction | P0 (FR-20 pdf/docx P1) |
| FR-21 | Download/preview | P1 |
| FR-22..23 | Statistics | P0 |
| FR-24..26 | Admin | P0 |
| FR-27 | Envelope/errors | P0 |
