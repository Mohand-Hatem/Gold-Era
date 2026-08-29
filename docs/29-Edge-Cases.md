# 29 — Edge Cases

Comprehensive edge-case catalogue with expected system behaviour. IDs `EC-nnn`. Grouped by area. Behaviour aligns with `11`, `19`, `30`.

## Authentication

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-001 | Invalid email format | 400 `ERR_VALIDATION`; inline error. |
| EC-002 | Weak password (<8 / no digit/letter) | 400 `ERR_VALIDATION`. |
| EC-003 | Duplicate email registration | 409 `ERR_EMAIL_TAKEN`. |
| EC-004 | Register with existing but unverified email | 409 (or resend prompt); no duplicate. MVP: 409. |
| EC-005 | Expired OTP | 400 `ERR_OTP_EXPIRED`; offer resend. |
| EC-006 | Wrong OTP | 400 `ERR_OTP_INVALID`; attempts++. |
| EC-007 | >5 OTP attempts | 429 `ERR_OTP_ATTEMPTS`; require resend. |
| EC-008 | Resend within cooldown | 429 `ERR_OTP_COOLDOWN`. |
| EC-009 | >5 resends/hour | 429 `ERR_OTP_RESEND_LIMIT`. |
| EC-010 | Verify already-verified account | 200 idempotent ("already verified") or 409 `ERR_ALREADY_VERIFIED` on resend. |
| EC-011 | Login before verification | 403 `ERR_EMAIL_NOT_VERIFIED`. |
| EC-012 | Login wrong password | 401 generic. |
| EC-013 | OTP for unknown email | 404 (documented enumeration trade-off) — could be generic in hardened mode. |

## Tokens / session

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-020 | Missing token on protected route | 401 `ERR_UNAUTHENTICATED`. |
| EC-021 | Malformed/invalid signature | 401. |
| EC-022 | Expired token | 401; FE clears cache + redirects login. |
| EC-023 | Token after role change (tokenVersion bump) | 401; must re-login. |
| EC-024 | Valid token, insufficient role | 403 `ERR_FORBIDDEN`. |
| EC-025 | Cookie blocked (3rd-party) in prod | Auth fails gracefully; documented cross-site cookie requirement (`24`). |

## Files — access & ownership

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-030 | Access another user's file (details/download/delete) | 403 `ERR_FORBIDDEN`. |
| EC-031 | Non-existent file id | 404 `ERR_FILE_NOT_FOUND`. |
| EC-032 | Admin accessing any file | Allowed (200). |
| EC-033 | Malformed id param | 400 `ERR_VALIDATION`. |

## Files — listing

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-040 | No files (empty account) | 200 empty list + meta; UI empty state. |
| EC-041 | Page beyond totalPages | 200 empty items + accurate meta. |
| EC-042 | `limit` > 100 | Clamped to 100. |
| EC-043 | `limit`/`page` non-numeric | Coerced or 400; default applied. |
| EC-044 | Invalid `sortBy` | Ignored → default sort. |
| EC-045 | Empty search string | Treated as no filter. |
| EC-046 | Search with special/regex chars | Treated as literal (Prisma contains), no injection. |
| EC-047 | Very large result set | Pagination bounds it; indexes used. |

## Files — upload

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-050 | Zero files submitted | 400 `ERR_VALIDATION`. |
| EC-051 | >5 files | Excess rejected (Multer count limit) → 400/`failed[]`. |
| EC-052 | File > 10MB | 413 `ERR_FILE_TOO_LARGE`. |
| EC-053 | Total request > 50MB | 413. |
| EC-054 | Unsupported extension | Rejected `ERR_UNSUPPORTED_TYPE`. |
| EC-055 | MIME spoof (exe as .png) | Magic-byte check rejects. |
| EC-056 | Duplicate file (same content) | Allowed; new row; checksum recorded. |
| EC-057 | Same filename twice | Allowed; distinct UUID storage keys. |
| EC-058 | Corrupted PDF/docx | Stored; `extractionStatus=FAILED`; upload 201. |
| EC-059 | Empty (0-byte) file | Rejected as invalid (min size 1 byte) → `failed[]`. |
| EC-060 | Scanned/image-only PDF | Stored; DONE with empty content (no OCR, P3). |
| EC-061 | Extremely long extracted text | Truncated to 20k chars. |
| EC-062 | Filename with path chars (`../`) | Sanitised; UUID storage; no traversal. |
| EC-063 | Storage write failure | No DB row; `failed[]`; no orphan. |
| EC-064 | DB write failure after blob written | Blob removed (cleanup); `failed[]`. |
| EC-065 | Upload while offline / network drop | FE surfaces error toast; no partial DB state. |

## Statistics

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-070 | User with zero files | totals 0, empty distribution/history; charts empty state. |
| EC-071 | Upload history gaps (days with no uploads) | Missing days filled with count 0. |
| EC-072 | Admin stats with zero users/files (fresh DB) | Zeros; only seeded admin counted. |

## Admin / users

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-080 | Non-admin hits admin route/API | 403 (FE also redirects). |
| EC-081 | Delete user who owns files | Cascade deletes files + blobs. |
| EC-082 | Admin deletes self | 403 `ERR_SELF_DELETE`. |
| EC-083 | Admin demotes self | 403 `ERR_SELF_DEMOTE`. |
| EC-084 | Delete already-deleted user/file | 404. |
| EC-085 | Change role to same role | 200 no-op (idempotent). |
| EC-086 | Delete the only admin (other than self) | Allowed if not self; system may end with the seeded admin. (No "last admin" lock beyond self-protection in MVP — documented.) |
| EC-087 | Concurrent delete of same file | First 200, second 404. |

## Platform / infra

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-090 | Missing critical env var at boot | Server fails fast with clear message (`25`). |
| EC-091 | SMTP unavailable | OTP send logged/failed; dev console fallback; user can resend. |
| EC-092 | DB connection lost | 500 `ERR_INTERNAL`; no crash loop; logged. |
| EC-093 | Blob missing from storage provider (deleted out-of-band) | Metadata row remains; download returns 404 handled gracefully. Redeploys no longer destroy blobs (ADR-039). |
| EC-094 | CORS origin mismatch | Browser blocks; documented exact-origin config (`24`). |
| EC-095 | Unknown route | 404 `ERR_NOT_FOUND` envelope. |
| EC-096 | Unhandled exception | Central errorHandler → 500; process stays up. |

## Frontend UX

| ID | Edge case | Expected behaviour |
|---|---|---|
| EC-100 | Slow network | Loading skeletons; `keepPreviousData` on pagination. |
| EC-101 | Query error | ErrorState + retry. |
| EC-102 | Rapid search typing | Debounced input (`useDebounce`). |
| EC-103 | Double-submit forms | Submit disabled while pending. |
| EC-104 | Logged-in user visits /login | Redirect to /dashboard. |
| EC-105 | `prefers-reduced-motion` | Animations reduced (P2). |
