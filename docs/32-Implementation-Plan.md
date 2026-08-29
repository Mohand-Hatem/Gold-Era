# 32 — Implementation Plan

Ordered build blueprint. Follows the phases in `27`; each step lists objective, prerequisites, files to create, dependencies (libs), implementation responsibility, APIs, DB involvement, expected output, and verification. No application code here.

## How to use

Work top to bottom. Do not start a step until its prerequisites pass verification. Backend precedes the frontend that consumes it. Commit after each verified step (`git-workflow` conventions, meaningful messages).

---

## Step 1 — Repo scaffold (Phase 1)

- **Objective:** runnable client + server skeletons.
- **Prereq:** empty `client/`, `server/`, `docs/`.
- **Create:** `server/package.json,tsconfig.json,src/app.ts,src/server.ts`; `client` via `create-next-app` (TS, Tailwind, App Router); root `.gitignore`.
- **Deps:** BE: express, typescript, tsx, @types/*. FE: next, react, tailwindcss.

  > Pinned in Phase 1: `express@5.2.1`, `typescript@5.9.3`, `tsx@4.23.12`, `@types/express@5.0.6`, `@types/node@26.4.0`; `next@16.3.3`, `react@19.2.8`, `tailwindcss@4.3.3`.
  > `tsx` replaces `ts-node-dev` (unmaintained since 2.0.0); it provides the same TS-execute-and-watch role for `npm run dev`. TypeScript is pinned to 5.9.3 rather than 7.x for toolchain compatibility.
- **Verify:** `npm run dev` boots each; `.env*` and `uploads/` ignored.

## Step 2 — Backend foundation (Phase 2)

- **Objective:** shared infra + error/validation + CORS + health.
- **Prereq:** Step 1.
- **Create:** `config/env.ts,cors.ts,constants.ts`; `utils/response.ts,AppError.ts,asyncHandler.ts`; `middleware/errorHandler.ts,notFound.ts,validate.ts,requestLogger.ts`; wire in `app.ts`; `/health`.
- **Deps:** zod@4.5.2, cors@2.8.6, @types/cors@2.8.19.
- **DB:** none — `config/prisma.ts` moves to Step 3 (DB-001b). **APIs:** GET /health.
- **Verify:** unknown route → 404 envelope; `/health` → ok; CORS reflects FRONTEND_URL with credentials and withholds Allow-Origin from others; missing/short `JWT_SECRET` exits 1; oversized body → 413; malformed JSON → 400.

  > Notes from execution: env files load via Node's native `--env-file-if-exists` (no `dotenv` dependency). `cookie-parser` deferred to Step 5 where cookies are first read. Logging is a local middleware, not `morgan`.

## Step 3 — Database (Phase 3)

- **Objective:** schema, migration, admin seed.
- **Prereq:** Step 2 (Prisma client).
- **Create:** `prisma/schema.prisma` (models+enums+indexes+cascade per `09`); `prisma/seed.ts`.
- **DB:** initial migration; seed admin (upsert, verified, ADMIN).
- **Verify:** `prisma migrate dev` clean; `prisma db seed` creates admin; `prisma studio` shows tables.

## Step 4 — Auth services & middleware (Phase 4a)

- **Objective:** crypto/token/otp/mail + auth/rbac middleware.
- **Prereq:** Step 3.
- **Create:** `services/password,token,otp,mail.service.ts`; `middleware/authenticate.ts,authorizeRole.ts`; `types/express.d.ts`.
- **Deps:** bcrypt, jsonwebtoken, nodemailer.
- **Verify:** unit-call hash/compare, sign/verify; authenticate rejects missing cookie (via later endpoint).

## Step 5 — Auth endpoints (Phase 4b)

- **Objective:** register/verify/resend/login/logout/profile.
- **Prereq:** Step 4.
- **Create:** `modules/auth/*` (routes/controller/service/repository/schemas); mount `/api/auth`.
- **APIs:** all `/auth/*` (`11`). **DB:** User, VerificationCode.
- **Verify:** manual/curl: full `12` flow; cookie set on login; profile 200 with cookie, 401 without.

## Step 6 — Storage, upload, extraction (Phase 5a)

- **Objective:** upload pipeline building blocks.
- **Prereq:** Step 3.
- **Create:** `services/storage.service.ts,extraction.service.ts`; `config/cloudinary.ts`; `middleware/upload.ts`; `utils/sanitizeFilename.ts,categorize.ts`.
- **Deps:** multer@2.3.0, @types/multer, cloudinary@2.11.0, file-type@16.5.4, pdf-parse@1.1.4, mammoth@1.12.2.

  > `uuid` dropped — Node's built-in `crypto.randomUUID()` replaces it (ADR-041). `file-type` and `pdf-parse` are pinned to their last CommonJS majors because the backend is CJS (ADR-040). Blobs go to Cloudinary via `StorageService`, not local disk (ADR-039); `multer-storage-cloudinary` is deliberately not used because it would store files before validation can run.
- **Verify:** unit: store+read+remove; extract sample txt/pdf/docx; oversize/type rejected by multer/filter.

## Step 7 — Files endpoints (Phase 5b)

- **Objective:** upload/list/details/delete/download + admin scope.
- **Prereq:** Steps 5–6.
- **Create:** `modules/files/*`; mount `/api/files`.
- **APIs:** `/files/*` (`11`). **DB:** File.
- **Verify:** upload single/multi/partial; list pagination/search/filter/sort; details ownership 403; delete removes blob; admin scope=all shows owner.

## Step 8 — Users & stats endpoints (Phase 6)

- **Objective:** admin user mgmt + statistics.
- **Prereq:** Step 7.
- **Create:** `modules/users/*`, `modules/stats/*`; mount `/api/users`, `/api/stats`.
- **APIs:** `/users/*`, `/stats/*`. **DB:** User/File aggregations, cascade delete.
- **Verify:** role change persists; self delete/demote → 403; delete user removes files+blobs; stats shapes match `21`.

## Step 9 — Frontend foundation (Phase 7)

- **Objective:** axios/query/providers/guards/primitives.
- **Prereq:** Step 2 to scaffold; **Step 5 required** to verify the profile query and guards (auth API must exist).
- **Create:** `lib/axios.ts,queryClient.ts`; `providers/*`; `components/ui/*`; `app/(protected)/layout.tsx`,`(admin)/layout.tsx`; `services/*`,`hooks/*` scaffolds.
- **Deps:** @tanstack/react-query, axios, framer-motion, recharts, react-hook-form(optional), zod.
- **Verify:** guard redirects; profile query returns user; 401 interceptor redirects.

## Step 10 — Auth UI (Phase 8)

- **Objective:** register/verify/login/profile screens.
- **Prereq:** Steps 5, 9.
- **Create:** `app/(public)/register,login,verify-email`; `app/(protected)/profile`; `features/auth/*`; `hooks/useRegister,useVerifyEmail,useResendCode,useLogin,useLogout`.
- **Verify:** end-to-end register→verify→login→profile→logout in browser.

## Step 11 — File UI (Phase 9)

- **Objective:** upload + My Files + details + delete.
- **Prereq:** Steps 7, 9.
- **Create:** `features/files/*` (Dropzone, progress, table/cards, filters, details, delete dialog); `app/(protected)/files`,`files/[id]`; `hooks/useFiles,useFile,useUploadFiles,useDeleteFile`.
- **Verify:** drag-drop multi upload with progress; search/filter/sort/paginate; details show extracted content; delete confirms + refreshes.

## Step 12 — Dashboards & Admin UI (Phase 10)

- **Objective:** stats + admin screens.
- **Prereq:** Steps 8, 9.
- **Create:** `features/dashboard/*`,`features/admin/*`; `app/(protected)/dashboard`,`(admin)/admin`,`admin/users`,`admin/files`; hooks `useUserStats,useAdminStats,useUsers,useUpdateUserRole,useDeleteUser,useAdminFiles,useDeleteAnyFile`.
- **Verify:** Recharts render; admin-only enforced (FE + BE); role/delete confirmations; recent uploads list.

## Step 13 — Integration & tests (Phase 11 → Phase 12)

- **Objective:** Phase 11 = end-to-end coherence (manual P0 pass, FE-040); Phase 12 = automated T0 tests (QA-001/002).
- **Prereq:** Steps 10–12.
- **Create:** `server/tests/*` (auth, files, users) + helpers; `vitest.config.ts`; `.env.test`.
- **Verify:** Phase 11 — all P0 flows manual pass; Phase 12 — `npm test` T0 green.

## Step 14 — Deployment (Phase 13)

- **Objective:** live stack.
- **Prereq:** Step 13.
- **Actions:** provision managed PG; deploy backend (build + `migrate deploy` + `db seed`, env incl. cookie None/Secure + CORS origin); deploy frontend (Vercel + `NEXT_PUBLIC_API_URL`).
- **Verify:** production login (cross-origin cookie) + upload succeed; `/health` ok; `24` checklist.

## Step 15 — Docs & final review (Phase 14)

- **Objective:** submission-ready.
- **Actions:** update root `README.md` (live URLs, setup, env, migrations, assumptions link) per `34`; run `35` checklist + `QUALITY REVIEW`.
- **Verify:** README complete; all P0 checklist items done; no secrets committed.

## Step → phase → task → requirement map

| Step | Phase | Tasks (`26`) | Requirements (`02`) |
|---|---|---|---|
| 1 | 1 | OPS-001, BE-000, FE-000, OPS-002 | enabling |
| 2 | 2 | BE-001..006 | SYS-001/002/003/005/006 |
| 3 | 3 | DB-001..004 | data model, ADR-019 |
| 4 | 4 | BE-010..015 | AUTH-007/009/010, NFR-001 |
| 5 | 4 | BE-016, BE-017(P1) | AUTH-001..006/008/011/012, USER-001 |
| 6 | 5 | BE-020..022 | FILE-006/008/009 |
| 7 | 5 | BE-023..028 | FILE-001/002/007/010..017, ADMIN-002 |
| 8 | 6 | BE-030..032, BE-040, BE-041 | USER-002..006, STAT-001..005, ADMIN-004 |
| 9 | 7 | FE-001..005 | AUTH-009/010 (UX), NFR-006/009 |
| 10 | 8 | FE-010..013 | AUTH-001..008/011 |
| 11 | 9 | FE-020..025 | FILE-003/004/005/010..016/018 |
| 12 | 10 | FE-030..033 | STAT-002/004, USER-002..005, ADMIN-001/003/005 |
| 13 | 11 + 12 | FE-040 (P11), QA-001/002 (P12) | all P0 verification |
| 14 | 13 | OPS-010..012 | deliverables (hosted) |
| 15 | 14 | DOC-001, QA-003 | deliverables (README, checklist) |

## Verification ladder (per step)

1. Type-check/build passes.
2. Step-specific manual/curl or unit check passes.
3. Relevant tests (once Phase 12) green.
4. Commit with a meaningful message.
