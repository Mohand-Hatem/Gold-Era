# 31 — Requirements Traceability Matrix

Maps every company requirement to its Requirement ID, phase, tasks, API, DB, tests, and acceptance criteria. Ensures nothing is forgotten. Coverage status: ✅ covered · 🟡 partial/derived · 🎁 optional (P2) · ⛔ out-of-scope (P3).

## Authentication

| Company requirement | ID | Phase | BE task | FE task | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| User Registration | AUTH-001 | 4 | BE-016 | FE-010 | POST /auth/register | User,VCode | auth | AC-01 | ✅ |
| Login | AUTH-005 | 4 | BE-016 | FE-012 | POST /auth/login | User | auth | AC-04 | ✅ |
| JWT Authentication | AUTH-007/009 | 4 | BE-011,014 | FE-001 | (cookie) | — | rbac | AC-04b | ✅ |
| Email Verification (OTP) | AUTH-002/003 | 4 | BE-012,016 | FE-011 | POST /auth/verify-email | VCode,User | auth | AC-02 | ✅ |
| Resend Verification Code | AUTH-004 | 4 | BE-016 | FE-011 | POST /auth/resend-code | VCode | auth | AC-03 | ✅ |
| Profile Page | AUTH-008/USER-001 | 4/8 | BE-016 | FE-013 | GET /auth/profile | User | auth | AC-04b | ✅ |
| Password hashing | AUTH-001/NFR-001 | 4 | BE-010 | — | — | User | auth | AC-01 | ✅ |
| Protected Routes | AUTH-009 | 4/7 | BE-014 | FE-004 | (all protected) | — | rbac | AC-04b | ✅ |
| Role-based Authorization | AUTH-010 | 4/7 | BE-015 | FE-004 | admin routes | User.role | rbac | AC-10/13 | ✅ |

## User features — Upload

| Company requirement | ID | Phase | BE | FE | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| Upload Files | FILE-001 | 5/9 | BE-023 | FE-021 | POST /files/upload | File | files | AC-05 | ✅ |
| Drag & Drop | FILE-003 | 9 | — | FE-020 | — | — | FE unit | AC-05 | ✅ |
| Progress indicator | FILE-004 | 9 | — | FE-021 | — | — | — | AC-05 | ✅ |
| File validation | FILE-005/006 | 5/9 | BE-021,023 | FE-020 | POST /files/upload | — | files | AC-05 | ✅ |
| Multiple file support | FILE-002 | 5/9 | BE-023 | FE-020/021 | POST /files/upload | File | files | AC-05 | ✅ |

## User features — My Files

| Company requirement | ID | Phase | BE | FE | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| List uploaded files | FILE-010 | 5/9 | BE-024 | FE-022 | GET /files | File | files | AC-06 | ✅ |
| Search | FILE-011 | 5/9 | BE-024 | FE-022 | GET /files?search | File(idx) | files | AC-06 | ✅ |
| Filter | FILE-012 | 5/9 | BE-024 | FE-022 | GET /files?category | File(idx) | files | AC-06 | ✅ |
| Sort | FILE-013 | 5/9 | BE-024 | FE-022 | GET /files?sortBy | File(idx) | files | AC-06 | ✅ |
| Pagination | FILE-010 | 5/9 | BE-024 | FE-022 | GET /files?page,limit | File | files | AC-06 | ✅ |
| Delete own file (manage files) | FILE-016 | 5/9 | BE-026 | FE-025 | DELETE /files/:id | File | files | AC-08 | ✅ |

## User features — File details

| Company requirement | ID | Phase | BE | FE | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| File metadata | FILE-014 | 5/9 | BE-025 | FE-023 | GET /files/:id | File | files | AC-07 | ✅ |
| File type | FILE-007 | 5 | BE-023 | FE-023 | GET /files/:id | File.mimeType/category | files | AC-07 | ✅ |
| File size | FILE-007 | 5 | BE-023 | FE-023 | GET /files/:id | File.size | files | AC-07 | ✅ |
| Upload date | FILE-007 | 5 | BE-023 | FE-023 | GET /files/:id | File.createdAt | files | AC-07 | ✅ |
| Extracted content | FILE-008 | 5/9 | BE-022 | FE-023 | GET /files/:id | File.extractedContent | files | AC-05/07 | ✅ |

## User features — Statistics

| Company requirement | ID | Phase | BE | FE | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| Total uploaded files | STAT-001 | 6/10 | BE-040 | FE-030 | GET /stats/user | File | stats | AC-09 | ✅ |
| Storage usage | STAT-001 | 6/10 | BE-040 | FE-030 | GET /stats/user | File.size | stats | AC-09 | ✅ |
| File types | STAT-001 | 6/10 | BE-040 | FE-030 | GET /stats/user | File.category | stats | AC-09 | ✅ |
| Upload history | STAT-005 | 6/10 | BE-040 | FE-030 | GET /stats/user | File.createdAt | stats | AC-09 | ✅ |

## Admin features

| Company requirement | ID | Phase | BE | FE | API | DB | Test | AC | Status |
|---|---|---|---|---|---|---|---|---|---|
| View users | USER-002 | 6/10 | BE-030 | FE-032 | GET /users | User | users | AC-10 | ✅ |
| Search users | USER-003 | 6/10 | BE-030 | FE-032 | GET /users?search | User | users | AC-10 | ✅ |
| Edit roles | USER-004 | 6/10 | BE-031 | FE-032 | PATCH /users/:id | User.role | users | AC-10 | ✅ |
| Delete users | USER-005 | 6/10 | BE-032 | FE-032 | DELETE /users/:id | User(cascade) | users | AC-10 | ✅ |
| View all files | ADMIN-002 | 5/10 | BE-028 | FE-033 | GET /files?scope=all | File | files | AC-11 | ✅ |
| Delete files (admin) | ADMIN-003 | 5/10 | BE-026 | FE-033 | DELETE /files/:id | File | files | AC-11 | ✅ |
| Files: search/filter/paginate | ADMIN-002 | 5/10 | BE-028 | FE-033 | GET /files?scope=all | File(idx) | files | AC-11 | ✅ |
| Admin: total users | STAT-003 | 6/10 | BE-041 | FE-031 | GET /stats/admin | User | stats | AC-12 | ✅ |
| Admin: total files | STAT-003 | 6/10 | BE-041 | FE-031 | GET /stats/admin | File | stats | AC-12 | ✅ |
| Admin: storage usage | STAT-003 | 6/10 | BE-041 | FE-031 | GET /stats/admin | File.size | stats | AC-12 | ✅ |
| Admin: most uploaded types | STAT-003 | 6/10 | BE-041 | FE-031 | GET /stats/admin | File.category | stats | AC-12 | ✅ |
| Admin: recent uploads | ADMIN-004 | 6/10 | BE-041 | FE-031 | GET /stats/admin | File.createdAt | stats | AC-12 | ✅ |
| Admin-only enforced FE+BE | ADMIN-001 | 4/7 | BE-015 | FE-004 | admin routes | — | rbac | AC-13 | ✅ |

## Backend endpoints (company list)

| Endpoint | ID | Status |
|---|---|---|
| POST /auth/register | AUTH-001 | ✅ |
| POST /auth/login | AUTH-005 | ✅ |
| POST /auth/verify-email | AUTH-003 | ✅ |
| POST /auth/resend-code | AUTH-004 | ✅ |
| GET /auth/profile | AUTH-008 | ✅ |
| GET /users | USER-002 | ✅ |
| PATCH /users/:id | USER-004 | ✅ |
| DELETE /users/:id | USER-005 | ✅ |
| POST /files/upload | FILE-001 | ✅ |
| GET /files | FILE-010 | ✅ |
| GET /files/:id | FILE-014 | ✅ |
| DELETE /files/:id | FILE-016 | ✅ |
| GET /stats/user | STAT-001 | ✅ |
| GET /stats/admin | STAT-003 | ✅ |

Additional endpoints beyond the company list (documented assumptions): `POST /auth/logout` (AUTH-011, ADR-009), `GET /files/:id/download` (FILE-017, ADR-023, P1), `GET /health` (SYS-005, ADR-026, P1). All business routes are mounted under `/api` (ADR-027).

## Cross-cutting requirements (not in the company feature list but required by it)

| Requirement | ID | Phase | Task | Doc | Test | AC | Status |
|---|---|---|---|---|---|---|---|
| Logout | AUTH-011 | 4/8 | BE-016 / FE-013 | `12` | auth | AC-04b | ✅ |
| Login blocked until verified | AUTH-006 | 4 | BE-016 | `12` | auth | AC-04 | ✅ |
| OTP attempt limit (brute-force guard) | AUTH-012 | 4 | BE-012,016 | `12`,`20` | auth | AC-02 | ✅ |
| Server-side file validation | FILE-006 | 5 | BE-021,023 | `13`,`18` | files | AC-05 | ✅ |
| File ownership enforcement | FILE-015 | 5 | BE-025,026 | `08`,`20` | files | AC-07/08 | ✅ |
| Admin dashboard rendering | STAT-004 | 10 | FE-031 | `21`,`22` | manual | AC-12 | ✅ |
| Consistent API envelope | SYS-001 | 2 | BE-003 | `11`,`19` | error-shape | AC-13 | ✅ |
| Central error handling | SYS-002 | 2 | BE-004 | `19` | error-shape | AC-13 | ✅ |
| Credentialed CORS | SYS-003 | 2 | BE-002 | `20`,`24` | manual | AC-13 | ✅ |
| Rate limiting | SYS-004 | 4 | BE-017 | `20` | — | — | 🟡 P1 |
| Health check | SYS-005 | 2 | BE-006 | `24` | manual | — | 🟡 P1 |
| Request logging | SYS-006 | 2 | BE-006 | `06` | — | — | 🟡 P1 |
| Input validation middleware | (AUTH/FILE all) | 2 | BE-005 | `18` | validation | AC-01/05 | ✅ |
| tokenVersion invalidation | AUTH-013 | 4/6 | BE-011,031 | `12` | rbac | AC-10 | 🟡 P1 |
| CSRF mitigation | AUTH-014 | 2/7 | BE-002 / FE-001 | `20` | — | — | 🟡 P1 |
| Confirmations on destructive actions | ADMIN-005 | 10 | FE-032,033 | `22` | FE unit | AC-13 | ✅ |
| Extraction failure non-blocking | FILE-009 | 5 | BE-022,023 | `13` | files | AC-05 | ✅ |
| Admin self-protection | USER-006 | 6 | BE-031,032 | `22` | users | AC-10 | ✅ |
| Own-profile view | USER-001 | 4/8 | BE-016 / FE-013 | `11` | auth | AC-04b | ✅ |
| Upload consistency/cleanup | NFR-010 | 5 | BE-023 | `13` | files | AC-05 | ✅ |
| Responsive UI | NFR-007 | 7–10 | FE-003,022,030 | `06`,`14` | manual | AC-14 | ✅ |
| Loading/empty/error states | NFR-006 | 7–10 | FE-003,022 | `14`,`17` | manual | AC-14 | ✅ |

## Database models (company list)

| Model | Doc | Status |
|---|---|---|
| User | `09` | ✅ |
| VerificationCode | `09` | ✅ |
| File | `09` | ✅ |

## Frontend requirements

| Requirement | Where | Status |
|---|---|---|
| Responsive design | `06`,`14` | ✅ |
| Clean Tailwind layout | `14` | ✅ |
| Framer Motion animations | `14` | ✅ |
| Loading states | `14`,`17` | ✅ |
| Error handling | `19` | ✅ |
| Toast notifications | `14`,`17` | ✅ |
| React Query caching | `17` | ✅ |

## Bonus features (company optional)

| Feature | ID | Status |
|---|---|---|
| Dark Mode | — | 🎁 P2 |
| Folder management | FILE-020 | 🎁 P2 |
| File preview | FILE-018 | 🟡 P1 (partial in MVP+) |
| Image preview | FILE-018 | 🟡 P1 |
| Download files | FILE-017 | 🟡 P1 |
| Soft delete | FILE-019 | 🎁 P2 |
| Audit logs | ADMIN-006 | 🎁 P2 |
| Refresh Token auth | AUTH-015 | 🎁 P2 |
| Docker support | SYS-007 | 🎁 P2 |
| Unit testing | (QA) | ✅ (T0 mandatory here) |

## Code-quality requirements

| Requirement | Where | Status |
|---|---|---|
| Clean Architecture | `15` | ✅ |
| Reusable Components | `14` | ✅ |
| Reusable Hooks | `14`,`17` | ✅ |
| Type Safety | `06`,`15` | ✅ |
| Folder Structure | `16` | ✅ |
| Naming Conventions | `16`,`33` | ✅ |
| Error Handling | `19` | ✅ |
| Input Validation | `18` | ✅ |
| Environment Variables | `25` | ✅ |
| Meaningful Git commits | `27`,`32`,`33` | ✅ |

## Deliverables

| Deliverable | Where | Status |
|---|---|---|
| GitHub repo (client+server) | `16` | ✅ planned |
| Hosted frontend | `24` | ✅ planned |
| Hosted backend | `24` | ✅ planned |
| README | `34` | ✅ planned |

## Reverse traceability — task → phase → requirement

Every task in `26` maps to at least one requirement. No orphan tasks.

| Task(s) | Phase | Serves |
|---|---|---|
| OPS-001, BE-000, FE-000, OPS-002 | 1 | enabling scaffold for all requirements; `25` env |
| BE-001..006 | 2 | SYS-001/002/003/005/006, NFR-011, validation for all |
| DB-001..004 | 3 | User/VerificationCode/File models; ADR-019 admin seed |
| BE-010..017 | 4 | AUTH-001..014 |
| BE-020..028 | 5 | FILE-001..018, ADMIN-002 |
| BE-030..032 | 6 | USER-002..006 |
| BE-040, BE-041 | 6 | STAT-001..005, ADMIN-004 |
| FE-001..005 | 7 | AUTH-009/010 (UX guards), NFR-006/007/009, `17` |
| FE-010..013 | 8 | AUTH-001..008/011, USER-001 |
| FE-020..025 | 9 | FILE-003/004/005/010..016/018 |
| FE-030..033 | 10 | STAT-002/004, USER-002..005, ADMIN-002/003/005 |
| FE-040 | 11 | all P0 (integration verification) |
| QA-001, QA-002 | 12 | test coverage for AUTH/FILE/USER/ADMIN/STAT |
| OPS-010..012 | 13 | deliverable: hosted frontend + backend + DB |
| DOC-001, QA-003 | 14 | deliverable: README; `33`/`35` gates |

## Coverage summary

- **Covered (✅):** all P0 company requirements — auth, files, statistics, admin, endpoints, models, frontend requirements, code quality, deliverables. Plus cross-cutting P0 (envelope, error handling, CORS, validation, confirmations, self-protection).
- **Partial/derived (🟡):** P1 items — download/preview (FILE-017/018), rate limiting (SYS-004), health (SYS-005), request logging (SYS-006), tokenVersion invalidation (AUTH-013), CSRF hardening (AUTH-014), user-enumeration hardening. None block P0.
- **Optional (🎁):** all listed bonus features (P2) — dark mode, folders, soft delete, audit logs, refresh tokens, Docker, dedupe UI, profile edit/password change.
- **Out-of-scope (⛔):** advanced OCR, folder hierarchies, sharing/collaboration, real-time editing, microservices (P3, `27`).
- **Missing:** none of the mandatory company requirements are uncovered.
- **Orphans:** 0 orphan requirements (every SRS ID has a phase+task+test+AC), 0 orphan tasks (every `26` task serves a requirement — see reverse-traceability table).
- **Duplicates:** none. FILE-007 legitimately appears three times (type/size/date are three company bullets served by one field-set requirement); ADMIN-002 twice (list + query features). These are one-to-many mappings, not duplicates.
