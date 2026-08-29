# 07 — Use Cases

Formal use-case specifications for the most important actions. Each maps to SRS IDs (`02`) and acceptance criteria (`28`).

Format: **ID · Actor · Goal · Preconditions · Trigger · Main scenario · Alternatives · Exceptions · Postconditions · Acceptance**.

---

## UC-01 Register account

- **Actor:** Guest · **Goal:** Create an account and receive a verification code.
- **Preconditions:** Not authenticated; email unused.
- **Trigger:** Submits the registration form.
- **Main scenario:** Enters name/email/password → system validates → hashes password → creates unverified user → generates+emails OTP → confirms "code sent".
- **Alternatives:** Email delivery delayed → user can resend (UC-03).
- **Exceptions:** Duplicate email → 409; invalid input → 400.
- **Postconditions:** Unverified user + active OTP exist.
- **Acceptance:** AC-01. **SRS:** AUTH-001/002.

## UC-02 Verify email

- **Actor:** Guest (email owner) · **Goal:** Activate the account.
- **Preconditions:** Unverified account; active OTP.
- **Trigger:** Submits code.
- **Main scenario:** Enters 6-digit code → system validates against latest active code → marks verified → invites login.
- **Alternatives:** Expired/lost code → resend (UC-03).
- **Exceptions:** Wrong code → invalid (+attempt); >5 attempts → blocked; expired → expired.
- **Postconditions:** `isEmailVerified=true`; code consumed.
- **Acceptance:** AC-02. **SRS:** AUTH-003/012.

## UC-03 Resend verification code

- **Actor:** Guest · **Goal:** Get a fresh OTP.
- **Preconditions:** Unverified account.
- **Trigger:** Clicks resend.
- **Main scenario:** System checks cooldown+hourly cap → invalidates prior code → creates+sends new → confirms.
- **Exceptions:** Cooldown active → wait; hourly limit → limited; already verified → informational.
- **Postconditions:** New active OTP.
- **Acceptance:** AC-03. **SRS:** AUTH-004.

## UC-04 Login

- **Actor:** Guest → User/Admin · **Goal:** Obtain an authenticated session.
- **Preconditions:** Verified account.
- **Trigger:** Submits credentials.
- **Main scenario:** System verifies password → issues JWT cookie → returns profile → client routes to dashboard.
- **Exceptions:** Unverified → 403; bad creds → 401.
- **Postconditions:** httpOnly cookie set.
- **Acceptance:** AC-04. **SRS:** AUTH-005/006/007.

## UC-05 Upload files

- **Actor:** User/Admin · **Goal:** Store one or more files with metadata + extracted content.
- **Preconditions:** Authenticated.
- **Trigger:** Drops/selects files and confirms.
- **Main scenario:** Client validates → uploads with progress → server validates each → stores blobs → persists metadata → extracts text → returns uploaded/failed lists → UI refreshes list + stats.
- **Alternatives:** Some files invalid → partial success (valid stored, invalid reported).
- **Exceptions:** All invalid → 400/415; oversize → 413; storage/DB error → cleanup, no orphans.
- **Postconditions:** New File rows + blobs; extraction status set.
- **Acceptance:** AC-05. **SRS:** FILE-001..009.

## UC-06 Browse & find files

- **Actor:** User (own) / Admin (all) · **Goal:** Locate files.
- **Preconditions:** Authenticated; files may exist.
- **Trigger:** Opens My Files / Admin Files; adjusts search/filter/sort/page.
- **Main scenario:** System returns paginated, filtered, sorted results scoped to owner (or all for admin) with meta.
- **Alternatives:** No files → empty state; no matches → empty results.
- **Exceptions:** Invalid sort ignored; out-of-range page → empty page.
- **Postconditions:** Results displayed.
- **Acceptance:** AC-06. **SRS:** FILE-010..013, ADMIN-002.

## UC-07 View file details

- **Actor:** Owner/Admin · **Goal:** Inspect metadata + extracted content/preview.
- **Preconditions:** File exists; caller is owner or admin.
- **Trigger:** Opens a file.
- **Main scenario:** System returns full record; UI shows metadata, and content/preview based on extractionStatus.
- **Exceptions:** Not owner/admin → 403; missing → 404.
- **Postconditions:** None (read-only).
- **Acceptance:** AC-07. **SRS:** FILE-014/015.

## UC-08 Delete file

- **Actor:** Owner/Admin · **Goal:** Remove a file.
- **Preconditions:** File exists; caller owner/admin.
- **Trigger:** Confirms delete.
- **Main scenario:** System removes blob + row → UI refreshes list + stats.
- **Exceptions:** Not owner/admin → 403; missing → 404.
- **Postconditions:** File and blob gone.
- **Acceptance:** AC-08. **SRS:** FILE-016, ADMIN-003.

## UC-09 View personal statistics

- **Actor:** User · **Goal:** Understand own usage.
- **Preconditions:** Authenticated.
- **Trigger:** Opens dashboard.
- **Main scenario:** System aggregates totals/storage/type-distribution/history → dashboard renders charts.
- **Alternatives:** Zero data → empty charts.
- **Postconditions:** None.
- **Acceptance:** AC-09. **SRS:** STAT-001/002/005.

## UC-10 Manage users (admin)

- **Actor:** Admin · **Goal:** Administer accounts.
- **Preconditions:** Admin session.
- **Trigger:** Opens user management.
- **Main scenario:** Lists/searches users → changes a role or deletes a user (with confirm) → list refreshes.
- **Exceptions:** Self-delete/self-demote → 403; non-admin → 403.
- **Postconditions:** User updated/removed (cascade).
- **Acceptance:** AC-10. **SRS:** USER-002..006, ADR-020.

## UC-11 Manage all files (admin)

- **Actor:** Admin · **Goal:** Oversee/remove any file.
- **Preconditions:** Admin session.
- **Trigger:** Opens file management.
- **Main scenario:** Lists all files with owner, search/filter/paginate → deletes any file (confirm) → refresh.
- **Exceptions:** Non-admin → 403; missing → 404.
- **Postconditions:** File removed.
- **Acceptance:** AC-11. **SRS:** ADMIN-002/003.

## UC-12 View admin statistics

- **Actor:** Admin · **Goal:** Monitor system usage.
- **Preconditions:** Admin session.
- **Trigger:** Opens admin dashboard.
- **Main scenario:** System aggregates total users/files/storage/top-types/recent uploads → dashboard renders.
- **Exceptions:** Non-admin → 403.
- **Postconditions:** None.
- **Acceptance:** AC-12. **SRS:** STAT-003/004, ADMIN-004.

## Use-case → acceptance/test map

| UC | Feature | AC | Priority |
|---|---|---|---|
| UC-01..04 | Auth | AC-01..04 | P0 |
| UC-05 | Upload | AC-05 | P0 |
| UC-06 | Browse/find | AC-06 | P0 |
| UC-07 | Details | AC-07 | P0 |
| UC-08 | Delete | AC-08 | P0 |
| UC-09 | User stats | AC-09 | P0 |
| UC-10 | User admin | AC-10 | P0 |
| UC-11 | File admin | AC-11 | P0 |
| UC-12 | Admin stats | AC-12 | P0 |
