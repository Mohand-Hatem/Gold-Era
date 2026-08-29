# 28 — Acceptance Criteria

Given/When/Then criteria for every P0 feature, including failure scenarios. Maps to use cases (`07`) and tests (`23`).

## AC-01 Registration (UC-01, AUTH-001/002)

- Given a guest with an unused email, When they submit valid name/email/password, Then a 201 is returned, an unverified user is created, and an OTP email is sent.
- Given an email already registered, When they register, Then 409 `ERR_EMAIL_TAKEN` and no new user.
- Given a weak password, When they register, Then 400 `ERR_VALIDATION` with field detail and no user created.

## AC-02 Email verification (UC-02, AUTH-003/012)

- Given a valid unexpired OTP, When submitted, Then account becomes verified and 200 is returned.
- Given a wrong OTP, When submitted, Then 400 `ERR_OTP_INVALID` and attempts increments.
- Given an expired OTP, When submitted, Then 400 `ERR_OTP_EXPIRED`.
- Given 5 failed attempts, When submitting again, Then 429 `ERR_OTP_ATTEMPTS` until a new code is issued.

## AC-03 Resend code (UC-03, AUTH-004)

- Given an unverified user past cooldown, When they request resend, Then a new OTP is sent and prior code invalidated.
- Given a request within 60s of the last, Then 429 `ERR_OTP_COOLDOWN`.
- Given >5 resends in an hour, Then 429 `ERR_OTP_RESEND_LIMIT`.

## AC-04 Login (UC-04, AUTH-005/006/007)

- Given a verified user with correct credentials, When they log in, Then 200 with the user object and an httpOnly `access_token` cookie is set.
- Given an unverified account, When they log in, Then 403 `ERR_EMAIL_NOT_VERIFIED`.
- Given wrong credentials, When they log in, Then 401 `ERR_INVALID_CREDENTIALS` (no field disclosure).

## AC-04b Protected access & logout (AUTH-008/009/011)

- Given no cookie, When calling `/auth/profile`, Then 401 `ERR_UNAUTHENTICATED`.
- Given a valid cookie, When calling `/auth/profile`, Then 200 with own profile.
- Given a logged-in user, When they log out, Then the cookie is cleared and subsequent protected calls 401.

## AC-05 File upload (UC-05, FILE-001..009)

- Given an authenticated user, When they upload 1–5 valid files (≤10MB each), Then 201 with `uploaded[]`, blobs stored, metadata persisted, and files appear in My Files.
- Given a mix of valid and invalid files, When uploaded, Then valid files are stored and invalid ones returned in `failed[]` with reasons.
- Given a file exceeding 10MB, Then 413 `ERR_FILE_TOO_LARGE`.
- Given a disallowed or spoofed type, Then it is rejected (`ERR_UNSUPPORTED_TYPE`) and not stored.
- Given a supported text/pdf/docx file, Then `extractedContent` is populated and `extractionStatus=DONE`.
- Given extraction throws, Then the file is still stored with `extractionStatus=FAILED` and upload succeeds.

## AC-06 Browse/find (UC-06, FILE-010..013)

- Given a user with files, When they open My Files, Then their own files are listed paginated with correct meta.
- Given a search term, Then only files whose name (or content) matches are returned.
- Given a category filter, Then only that category is returned.
- Given a sort by size desc, Then results are ordered largest-first.
- Given an out-of-range page, Then an empty list with correct meta is returned.
- Given no files, Then an empty state is shown.

## AC-07 File details (UC-07, FILE-014/015)

- Given an owner, When they open a file, Then metadata (type, size, upload date) and extracted content/preview are shown.
- Given a non-owner user, When they request another user's file, Then 403 `ERR_FORBIDDEN`.
- Given a non-existent id, Then 404 `ERR_FILE_NOT_FOUND`.

## AC-08 Delete file (UC-08, FILE-016)

- Given an owner, When they confirm delete, Then the row and blob are removed and the list refreshes.
- Given a non-owner (non-admin), When they delete, Then 403.

## AC-09 User statistics (UC-09, STAT-001/002)

- Given an authenticated user, When they open the dashboard, Then total files, storage used, type distribution, and upload history render from real data.
- Given a user with no files, Then dashboards render zero/empty states without error.

## AC-10 Admin user management (UC-10, USER-002..006)

- Given an admin, When they list users, Then users appear with role, verified status, and file count, paginated + searchable.
- Given an admin changes a user's role, Then it persists and the user's existing tokens are invalidated.
- Given an admin deletes a user, Then the user and all their files (rows + blobs) are removed.
- Given an admin attempts to delete or demote themselves, Then 403 `ERR_SELF_DELETE`/`ERR_SELF_DEMOTE`.
- Given a non-admin, When they call `/users`, Then 403.

## AC-11 Admin file management (UC-11, ADMIN-002/003)

- Given an admin, When they open all-files, Then files from all users are listed with an owner column, searchable/filterable/paginated.
- Given an admin deletes any file, Then it is removed regardless of owner.
- Given a non-admin, When they request `scope=all`, Then results are scoped to their own files (not an error).

## AC-12 Admin statistics (UC-12, STAT-003/004)

- Given an admin, When they open the admin dashboard, Then total users, total files, storage used, top file types, and recent uploads render.
- Given a non-admin, When they call `/stats/admin`, Then 403.

## AC-13 Cross-cutting (SYS-001/002/003, ADMIN-005)

- Given any endpoint, When it responds, Then it uses the standard success/error envelope.
- Given an unexpected server error, Then a generic 500 `ERR_INTERNAL` is returned with no stack leaked.
- Given a destructive admin action in the UI, When triggered, Then a confirmation dialog is required first.
- Given the frontend admin guard is bypassed, When an admin API is called by a non-admin, Then the backend still returns 403.

## AC-14 Responsiveness & UX (NFR-006/007)

- Given any async view, When loading, Then a loading state is shown; on empty, an empty state; on error, an error state with retry.
- Given a mobile viewport, When viewing lists/dashboards, Then layouts adapt without horizontal overflow.
- Given a successful/failed mutation, Then a toast communicates the outcome.
