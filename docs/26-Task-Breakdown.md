# 26 — Task Breakdown

Engineering backlog. Each task: **ID · Phase · Area · Priority · Name · Description · Dependencies · Files/components · Expected result · Acceptance**. Areas: BE, FE, DB, OPS, QA. Phases defined in `27`.

## Phase 1 — Planning & scaffold

| ID | Area | Pri | Task | Depends | Key files | Acceptance |
|---|---|---|---|---|---|---|
| OPS-001 | OPS | P0 | Init monorepo dirs `client/`,`server/`,`docs/`; root .gitignore | — | `.gitignore` | dirs exist; env/uploads ignored |
| BE-000 | BE | P0 | Scaffold Express+TS (tsconfig, scripts, app/server) | OPS-001 | `server/*` | `npm run dev` boots |
| FE-000 | FE | P0 | Scaffold Next.js App Router + Tailwind | OPS-001 | `client/*` | dev server renders |
| OPS-002 | OPS | P0 | `.env.example` both apps | BE-000,FE-000 | `.env.example` | matches `25` |

## Phase 2 — Backend foundation

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| BE-001 | BE | P0 | env config (Zod, fail-fast) | BE-000 | `config/env.ts`,`config/constants.ts` | missing var crashes |
| BE-002 | BE | P0 | credentialed CORS + JSON/body limits | BE-001 | `config/cors.ts` | CORS allows FRONTEND_URL w/ credentials |
| BE-003 | BE | P0 | response envelope + AppError + asyncHandler | BE-000 | `utils/*` | helpers unit-usable |
| BE-004 | BE | P0 | errorHandler + notFound middleware | BE-003 | `middleware/*` | unknown route → 404 envelope |
| BE-005 | BE | P0 | validate(zod) middleware | BE-003 | `middleware/validate.ts` | bad body → 400 details |
| BE-006 | BE | P1 | requestLogger + /health | BE-002 | `middleware/requestLogger.ts` | /health → ok |

## Phase 3 — Database

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| DB-001 | DB | P0 | schema.prisma: User, VerificationCode, File + enums | BE-002 | `prisma/schema.prisma` | matches `09` |
| DB-001b | DB | P0 | Prisma client singleton (moved from BE-002 — `@prisma/client` cannot be imported before the schema exists) | DB-001 | `config/prisma.ts` | singleton importable; one instance |
| DB-002 | DB | P0 | indexes + constraints + cascade | DB-001 | schema | unique email/storageKey; cascades |
| DB-003 | DB | P0 | initial migration | DB-002 | `prisma/migrations` | `migrate dev` clean |
| DB-004 | DB | P0 | admin seed (idempotent) | DB-003 | `prisma/seed.ts` | admin upserted, verified |

## Phase 4 — Auth & authorization

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| BE-010 | BE | P0 | PasswordService (bcrypt) | BE-001 | `services/password.service.ts` | hash/compare |
| BE-011 | BE | P0 | TokenService (JWT sign/verify + cookie opts) | BE-001 | `services/token.service.ts` | 7d HS256; cookie flags env-driven |
| BE-012 | BE | P0 | OtpService (gen/hash/validate + rate rules) | BE-001 | `services/otp.service.ts` | 6-digit,10min,5 attempts |
| BE-013 | BE | P0 | MailService (nodemailer + console fallback) | BE-001 | `services/mail.service.ts` | sends or logs OTP |
| BE-014 | BE | P0 | authenticate middleware | BE-011 | `middleware/authenticate.ts` | no cookie → 401 |
| BE-015 | BE | P0 | authorizeRole middleware | BE-014 | `middleware/authorizeRole.ts` | non-admin → 403 |
| BE-016 | BE | P0 | auth module: register/verify/resend/login/logout/profile | BE-010..015,DB-004 | `modules/auth/*` | matches `11` |
| BE-017 | BE | P1 | rate limit on auth | BE-016 | `middleware/rateLimit.ts` | limits enforced |

## Phase 5 — Files

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| BE-020 | BE | P0 | StorageService (Cloudinary upload/stream/remove, ADR-039) | BE-001 | `services/storage.service.ts`,`config/cloudinary.ts` | upload/stream/remove |
| BE-021 | BE | P0 | upload middleware (multer memory+limits+fileFilter) | BE-020 | `middleware/upload.ts` | size/count/type enforced |
| BE-022 | BE | P0 | ExtractionService (txt/json/pdf/docx) | BE-001 | `services/extraction.service.ts` | text extracted; failure safe |
| BE-023 | BE | P0 | files module: upload (validate+store+extract+persist) | BE-020..022 | `modules/files/*` | 201 uploaded/failed |
| BE-024 | BE | P0 | files list (own) + search/filter/sort/paginate | BE-023 | files module | matches `11`/`24` semantics |
| BE-025 | BE | P0 | file details + ownership | BE-023 | files module | 403 cross-owner |
| BE-026 | BE | P0 | delete file (row+blob) | BE-023 | files module | blob removed |
| BE-027 | BE | P1 | download/stream (owner/admin) | BE-025 | files module | streams w/ content-type |
| BE-028 | BE | P0 | admin scope=all listing | BE-024,BE-015 | files module | owner column; admin only |

## Phase 6 — Users (admin) & Stats

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| BE-030 | BE | P0 | users list/search/paginate (admin) | BE-015 | `modules/users/*` | meta correct |
| BE-031 | BE | P0 | patch role + self-demote guard | BE-030 | users module | self-demote → 403 |
| BE-032 | BE | P0 | delete user (cascade + blob cleanup) + self-delete guard | BE-030,BE-020 | users module | files+blobs gone; self → 403 |
| BE-040 | BE | P0 | stats/user aggregation | BE-024 | `modules/stats/*` | shapes per `21` |
| BE-041 | BE | P0 | stats/admin aggregation | BE-030,BE-024 | stats module | shapes per `21`; admin only |

## Phase 7 — Frontend foundation

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| FE-001 | FE | P0 | Axios instance (withCredentials, X-Requested-With, 401 handler) | FE-000 | `lib/axios.ts` | 401 → redirect login |
| FE-002 | FE | P0 | QueryClient + providers (Query/Theme/Toast/Auth) | FE-001 | `providers/*` | app wrapped |
| FE-003 | FE | P0 | UI primitives (Button/Input/Table/Dialog/Toast/Skeleton/EmptyState/Pagination/ProgressBar) | FE-000 | `components/ui/*` | reusable, styled |
| FE-004 | FE | P0 | AuthProvider (profile query) + guards (protected/admin layouts) | FE-002 | `app/(protected)/layout.tsx`,`(admin)/layout.tsx` | redirects work |
| FE-005 | FE | P0 | services + hooks scaffolding | FE-001 | `services/*`,`hooks/*` | typed calls |

## Phase 8 — Auth UI

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| FE-010 | FE | P0 | Register page + form | FE-003,FE-005,BE-016 | `app/(public)/register` | 201 → verify |
| FE-011 | FE | P0 | Verify-email page + resend | FE-010 | `verify-email` | verify → login |
| FE-012 | FE | P0 | Login page | FE-005,BE-016 | `login` | cookie set → dashboard |
| FE-013 | FE | P0 | Profile page + logout | FE-004,BE-016 | `profile` | shows profile; logout clears |

## Phase 9 — File UI

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| FE-020 | FE | P0 | Dropzone + multi-select + client validation | FE-003 | `features/files/Dropzone` | rejects invalid |
| FE-021 | FE | P0 | Upload mutation + progress + toasts | FE-020,BE-023 | `hooks/useUploadFiles` | progress + invalidation |
| FE-022 | FE | P0 | My Files list + search/filter/sort/paginate + empty/loading | FE-005,BE-024 | `app/(protected)/files` | URL-synced params |
| FE-023 | FE | P0 | File details + metadata + extracted content | BE-025 | `files/[id]` | shows content/status |
| FE-024 | FE | P1 | Image/text preview via download | BE-027 | file details | preview renders |
| FE-025 | FE | P0 | Delete file + confirm dialog | BE-026 | files list/details | confirms + refreshes |

## Phase 10 — Dashboards & Admin UI

| ID | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|
| FE-030 | FE | P0 | User dashboard (Recharts: totals/storage/types/history) | BE-040 | `dashboard` | charts render |
| FE-031 | FE | P0 | Admin dashboard (Recharts + recent uploads) | BE-041 | `admin` | admin-only |
| FE-032 | FE | P0 | Admin users table + role change + delete (confirm) | BE-030..032 | `admin/users` | self-guard reflected |
| FE-033 | FE | P0 | Admin files table (all) + search/filter/paginate + delete | BE-028,BE-026 | `admin/files` | owner column |

## Phases 11–14 — Integration, testing, deployment, docs

> Phase mapping (per `27`): QA-001/QA-002 → **Phase 12**; FE-040 → **Phase 11**; OPS-010..012 → **Phase 13**; DOC-001/QA-003 → **Phase 14**.

| ID | Phase | Area | Pri | Task | Depends | Files | Acceptance |
|---|---|---|---|---|---|---|---|
| FE-040 | 11 | FE/QA | P0 | End-to-end manual pass of all P0 flows | all FE/BE | — | flows work |
| QA-001 | 12 | QA | P0 | Backend T0 tests (auth/rbac/ownership/upload/admin) | Phases 4–6 | `server/tests/*` | T0 green |
| QA-002 | 12 | QA | T1 | Query/stats/extraction tests | BE-024/040/022 | tests | pass |
| OPS-010 | 13 | OPS | P0 | Deploy DB (managed PG) | DB-003 | — | reachable |
| OPS-011 | 13 | OPS | P0 | Deploy backend + migrate deploy + seed | OPS-010 | — | API live, admin seeded |
| OPS-012 | 13 | OPS | P0 | Deploy frontend (Vercel) + env | OPS-011 | — | app live, auth works cross-origin |
| DOC-001 | 14 | OPS | P0 | Update root README (URLs, setup) | OPS-012 | `README.md` | matches `34` |
| QA-003 | 14 | QA | P0 | Final submission checklist pass | all | `35` | all P0 ticked |

## Task counts

| Area | P0 | P1 | T1 |
|---|---|---|---|
| BE | 26 | 3 | — |
| FE | 20 | 1 | — |
| DB | 4 | — | — |
| OPS | 6 | — | — |
| QA | 2 | — | 1 |

Totals: **58 P0**, 4 P1, 1 T1. (BE P0 = BE-000 + BE-001..005 + BE-010..016 + BE-020..026,028 + BE-030..032,040,041.)
