# 30 — Assumptions & Technical Decisions

This is the **canonical decision log**. Every ambiguous requirement in the company task is resolved here. When any other document disagrees with this one on a decision, this document wins.

Two decisions were made by the human reviewer and are locked:

- **ADR-014 Charts → Recharts**
- **ADR-008 Token storage → httpOnly secure cookies with credentialed CORS**

## Legend

- **Ambiguity** — what the company task left open.
- **Decision** — the chosen resolution.
- **Reason** — why.
- **Impact** — what it touches.
- **Priority** — P0 mandatory / P1 important / P2 bonus / P3 out of scope.

---

## ADR-001 — Database engine

| | |
|---|---|
| Ambiguity | Task allows "PostgreSQL (or MySQL)". |
| Decision | **PostgreSQL 16**. |
| Reason | First-class Prisma support, rich indexing (partial, GIN), free managed tiers (Neon, Supabase, Render). Case-insensitive search via `mode: "insensitive"`. |
| Impact | `DATABASE_URL`, Prisma `provider = "postgresql"`, deployment. |
| Priority | P0 |

## ADR-002 — Maximum file size & batch size

| | |
|---|---|
| Ambiguity | No size or count limit given. |
| Decision | **10 MB per file**, **max 5 files per upload request**, **max 50 MB per request**. |
| Reason | Large enough for real documents/images, small enough to survive free-tier request limits and ephemeral disks. |
| Impact | Multer limits, Zod validation, client pre-validation, error `ERR_FILE_TOO_LARGE`. |
| Priority | P0 |

## ADR-003 — Allowed file types

| | |
|---|---|
| Ambiguity | "File validation" required; no allow-list defined. |
| Decision | Allow-list: `txt, md, csv, json, pdf, docx, png, jpg, jpeg, webp`. Validate by **extension + declared MIME + magic-byte sniff** (`file-type`). All three must agree. |
| Reason | Covers text, documents and images for extraction and previews while blocking executables and MIME spoofing. |
| Impact | Multer `fileFilter`, validation service, error `ERR_UNSUPPORTED_TYPE`. |
| Priority | P0 |

## ADR-004 — Storage strategy

| | |
|---|---|
| Ambiguity | Storage location unspecified. |
| Decision | **Local disk** at `server/uploads/` in MVP, accessed only through a `StorageService` abstraction. Stored filename is a generated UUID; original name kept in DB. |
| Reason | Zero external setup for an 8–10h build. Abstraction allows a later swap to S3/R2 without touching controllers. |
| Impact | `StorageService`, file download/stream route, deployment note (see risk below). |
| Priority | P0 |
| Risk | Render/Railway/Fly free dynos have **ephemeral** disk — uploaded files vanish on redeploy. Documented in `24` and README. Persistent-disk or object storage is the P1 upgrade. |

## ADR-005 — Content extraction scope

| | |
|---|---|
| Ambiguity | "Extracted content" required; formats and depth unspecified. |
| Decision | MVP extracts UTF-8 text for `txt/md/csv/json`; `pdf` via `pdf-parse`; `docx` via `mammoth`. **Images: no extraction** (`extractedContent = null`). Extracted text **truncated to 20 000 characters**. |
| Reason | Covers the majority of realistic uploads with mature libraries and no native/system dependencies. |
| Impact | `ExtractionService`, `File.extractedContent`, `File.extractionStatus`. |
| Priority | P0 (text/json), P1 (pdf/docx) |

## ADR-006 — Extraction failure behaviour

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | Extraction failure **never fails the upload**. File is stored; `extractionStatus = FAILED`, `extractedContent = null`. Values: `PENDING`, `DONE`, `SKIPPED`, `FAILED`. |
| Reason | Upload durability matters more than extraction completeness. |
| Impact | Upload flow, file details UI. |
| Priority | P0 |

## ADR-007 — JWT strategy

| | |
|---|---|
| Ambiguity | JWT required; lifetime/algorithm/payload unspecified. |
| Decision | Single **access token**, **HS256**, **7-day** expiry. Payload `{ sub: userId, role, tokenVersion, iat, exp }`. Signed with `JWT_SECRET`. |
| Reason | Stateless, simple, sufficient for the assessment window. `tokenVersion` enables server-side invalidation on role change / delete. |
| Impact | `TokenService`, auth middleware, `User.tokenVersion`. |
| Priority | P0 |

## ADR-008 — Token storage & transport *(locked by reviewer)*

| | |
|---|---|
| Ambiguity | Where the client keeps the JWT. |
| Decision | **httpOnly, Secure, `SameSite=None` cookie** named `access_token`. **Credentialed CORS** (`Access-Control-Allow-Credentials: true`, explicit origin allow-list). Axios `withCredentials: true`. |
| Reason | httpOnly cookies are immune to XSS token theft. Reviewer decision. |
| Impact | Login/verify/logout set/clear cookie; CORS config; auth middleware reads cookie (Bearer header accepted as fallback for tests); `24` deployment; `20` security. |
| Priority | P0 |
| Notes | `SameSite=None` is required because Vercel (frontend) and Render (backend) are different sites; it mandates `Secure`, so HTTPS is required in production. A CSRF mitigation is added (see ADR-021). |

## ADR-009 — Logout strategy

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | `POST /auth/logout` clears the cookie (`Max-Age=0`). Client clears React Query cache. Optional `tokenVersion` bump for global invalidation. |
| Reason | Stateless JWT needs no server session; cookie clear is enough. |
| Impact | Auth module, frontend logout action. |
| Priority | P0 |

## ADR-010 — OTP policy

| | |
|---|---|
| Ambiguity | OTP length, TTL, attempt/resend limits unspecified. |
| Decision | **6-digit** numeric OTP. **TTL 10 minutes**. Stored **hashed** (bcrypt). **Max 5 verify attempts** per active code. **Resend cooldown 60 s**, **max 5 resends/hour**. Latest code invalidates previous ones. |
| Reason | Standard, user-friendly, brute-force resistant. |
| Impact | `VerificationCode` model, auth service, errors `ERR_OTP_INVALID`, `ERR_OTP_EXPIRED`, `ERR_OTP_ATTEMPTS`, `ERR_OTP_COOLDOWN`. |
| Priority | P0 |

## ADR-011 — Email delivery

| | |
|---|---|
| Ambiguity | Delivery mechanism unspecified; env gives `GMAIL_USER`/`GMAIL_PASS`. |
| Decision | **Nodemailer** via Gmail SMTP using an **App Password**. If credentials are absent (dev), log the OTP to console via a `MailService` fallback. |
| Reason | Matches provided env vars; console fallback keeps local dev unblocked. |
| Impact | `MailService`, env vars, auth flow. |
| Priority | P0 |

## ADR-012 — Pagination

| | |
|---|---|
| Ambiguity | Page size/strategy unspecified. |
| Decision | **Offset pagination**. `page` (default 1), `limit` (default 10, max 100). Response meta `{ page, limit, total, totalPages }`. |
| Reason | Simplest correct approach for admin/user tables of assessment scale. |
| Impact | Files list, users list, admin files. |
| Priority | P0 |

## ADR-013 — Deletion behaviour

| | |
|---|---|
| Ambiguity | Hard vs soft delete unspecified. |
| Decision | **Hard delete** in MVP. Deleting a file removes the DB row **and** the stored blob. Deleting a user **cascades** to their files (and blobs) and verification codes. |
| Reason | Simpler and matches "Delete" wording. Soft delete is a listed bonus. |
| Impact | Prisma `onDelete: Cascade`, file service must remove blobs before/after row delete. |
| Priority | P0 |
| Bonus | Soft delete (`deletedAt`) = **P2** (`ADR-013b`). |

## ADR-014 — Charts library *(locked by reviewer)*

| | |
|---|---|
| Ambiguity | Charts required; library unspecified. |
| Decision | **Recharts**. |
| Reason | Reviewer decision. Declarative, React-native, quick to build bar/pie/line for the required dashboards. |
| Impact | `client` dependency; dashboard components; adds one dependency beyond the mandated stack (accepted). |
| Priority | P0 |

## ADR-015 — Duplicate file handling

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | **Allowed**. Each upload is a distinct row with a UUID storage name. A **SHA-256 `checksum`** is stored to enable future dedupe/UI hints; no dedupe enforced in MVP. |
| Reason | Blocking duplicates adds friction and complexity with little assessment value. |
| Impact | `File.checksum`, upload service. |
| Priority | P0 (store checksum), P2 (act on it) |

## ADR-016 — Filename handling & sanitisation

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | Persist `originalName` (validated, length ≤ 255, control chars stripped) for display. Stored file is `<uuid>.<ext>`. Never use client filename for disk path. |
| Reason | Prevents path traversal and collisions. |
| Impact | Upload service, download route. |
| Priority | P0 |

## ADR-017 — Validation library

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | **Zod** on backend (authoritative) and frontend (advisory). Shared shape conventions documented in `18`. |
| Reason | TypeScript-first, single mental model both sides. |
| Impact | Request validation middleware, form validation. |
| Priority | P0 |

## ADR-018 — Password hashing

| | |
|---|---|
| Ambiguity | "Password hashing" required; algorithm unspecified. |
| Decision | **bcrypt**, cost factor **12**. |
| Reason | Battle-tested, sufficient, simple. |
| Impact | Auth service, `User.password`. |
| Priority | P0 |

## ADR-019 — Admin bootstrap (seeding)

| | |
|---|---|
| Ambiguity | How the first admin exists. Env provides `ADMIN_EMAIL/NAME/PASSWORD`. |
| Decision | **Prisma seed script** creates/updates the admin from env, pre-verified (`isEmailVerified = true`), `role = ADMIN`. Idempotent (upsert). |
| Reason | Guarantees a working admin login in every environment. |
| Impact | `prisma/seed.ts`, deployment step. |
| Priority | P0 |

## ADR-020 — Admin self-protection

| | |
|---|---|
| Ambiguity | Not specified. |
| Decision | An admin **cannot delete their own account** and **cannot demote themselves** from ADMIN. Backend-enforced. |
| Reason | Prevents accidental lockout. |
| Impact | Users controller guards, errors `ERR_SELF_DELETE`, `ERR_SELF_DEMOTE`. |
| Priority | P0 |

## ADR-021 — CSRF mitigation for cookie auth

| | |
|---|---|
| Ambiguity | Introduced by ADR-008 (cookie auth is CSRF-exposed). |
| Decision | Use `SameSite=None` cookie **plus** a lightweight defence: require a custom header `X-Requested-With: fetch` on state-changing requests and strict CORS origin allow-list. Full double-submit CSRF token = P1. |
| Reason | Custom-header requirement blocks classic form-based CSRF because cross-site HTML forms cannot set custom headers; strict CORS blocks credentialed cross-origin reads. |
| Impact | Axios default header, CORS config, security doc. |
| Priority | P1 |

## ADR-022 — Refresh tokens

| | |
|---|---|
| Ambiguity | Listed as optional bonus. |
| Decision | **Not implemented in MVP.** 7-day access token is sufficient. |
| Reason | Adds rotation/storage complexity beyond the budget. |
| Impact | None in MVP. |
| Priority | P2 |

## ADR-023 — File download / preview

| | |
|---|---|
| Ambiguity | Download listed as bonus; details view must show content. |
| Decision | Provide an **authenticated** `GET /files/:id/download` streaming route (owner or admin only). Image preview and text preview in details view use it. Inline vs attachment via `?disposition=`. |
| Reason | Needed to display images and to satisfy the bonus cheaply. |
| Impact | Files module, file details UI. |
| Priority | P1 |

## ADR-024 — Search / filter / sort semantics

| | |
|---|---|
| Ambiguity | Fields and operators unspecified. |
| Decision | **Search**: case-insensitive `contains` on `originalName` (+ optional `extractedContent` for user files). **Filter**: by `type` category (document/image/text/other) and/or `mimeType`. **Sort**: `createdAt`, `size`, `originalName`; `asc`/`desc`; default `createdAt desc`. Whitelisted sort fields only. |
| Reason | Predictable, index-friendly, injection-safe. |
| Impact | Files query builder, indexes (`09`), API (`11`). |
| Priority | P0 |

## ADR-025 — API response envelope

| | |
|---|---|
| Ambiguity | Response shape unspecified. |
| Decision | Success: `{ "success": true, "data": ... , "meta"?: ... }`. Error: `{ "success": false, "error": { "code", "message", "details"? } }`. Defined fully in `11` and `19`. |
| Reason | Consistency simplifies the React Query + Axios layer. |
| Impact | All endpoints, error middleware, frontend response typing. |
| Priority | P0 |

## ADR-026 — Health check

| | |
|---|---|
| Ambiguity | Not required but needed for deploy monitoring. |
| Decision | `GET /health` → `{ status: "ok", uptime, timestamp }`, unauthenticated. |
| Reason | Platform health probes and quick liveness check. |
| Impact | One route. |
| Priority | P1 |

## ADR-027 — API base path & versioning

| | |
|---|---|
| Ambiguity | Task lists paths without a prefix (`/auth/...`). |
| Decision | Mount all business routes under **`/api`** (e.g. `/api/auth/register`). `/health` stays at root. No version segment in MVP. `NEXT_PUBLIC_API_URL` points at the origin; client appends `/api`. |
| Reason | Clean separation of API vs infra routes; avoids collision with platform routes. |
| Impact | Router mounting, frontend Axios `baseURL`. |
| Priority | P0 |
| Note | The company sample paths omit `/api`; this prefix is an assumption and is reflected consistently in `11`. |

## ADR-028 — JSON body size limit

| | |
|---|---|
| Ambiguity | `20` requires a body size limit; no value specified. |
| Decision | **100 KB** for `express.json()` and `express.urlencoded()`. Multipart uploads are unaffected and bound by Multer instead (10 MB/file, 50 MB/request — ADR-002). |
| Reason | Every documented JSON body is small (register, login, OTP, role patch). A tight limit minimises the DoS surface at no functional cost. |
| Impact | `config/constants.ts` `JSON_BODY_LIMIT`; `app.ts`; oversized body → 413 `ERR_FILE_TOO_LARGE`. |
| Priority | P0 |

## ADR-029 — Env file loading without `dotenv`

| | |
|---|---|
| Ambiguity | How `.env` reaches `process.env` in dev and production. |
| Decision | Node's native **`--env-file-if-exists=.env`** flag in the `dev` and `start` scripts. No `dotenv` dependency. |
| Reason | Node 20+ loads env files natively; adding `dotenv` would be an unnecessary dependency. `-if-exists` keeps production working where the platform injects env vars directly and no `.env` file is present. |
| Impact | `server/package.json` scripts. |
| Priority | P0 |

## ADR-030 — Request logging without `morgan`

| | |
|---|---|
| Ambiguity | `32` originally listed `morgan` for request logging (P1). |
| Decision | A **~15-line local middleware** logging exactly `method path status duration`. No `morgan`. |
| Reason | NFR-011 asks for those four fields; a dependency is not justified for that, and it lets us guarantee no bodies, headers, or cookies are ever logged (`20` §7). |
| Impact | `middleware/requestLogger.ts`. |
| Priority | P1 |

## ADR-031 — `JWT_SECRET` minimum length enforced at boot

| | |
|---|---|
| Ambiguity | `25` recommends "≥32 bytes" but nothing enforced it. |
| Decision | `env.ts` requires **≥32 characters**; the process exits if shorter. |
| Reason | Converts a documentation recommendation into a guarantee, and prevents a weak signing key from reaching production. |
| Impact | `config/env.ts`; deployment must set a proper secret. |
| Priority | P0 |

## ADR-032 — Separate direct URL for migrations (`DIRECT_URL`)

| | |
|---|---|
| Ambiguity | `25` documented only `DATABASE_URL`. Managed Postgres providers expose a pooled and an unpooled endpoint. |
| Decision | Two variables: **`DATABASE_URL`** (pooled, application runtime) and **`DIRECT_URL`** (unpooled, migrations). Prisma's `datasource.directUrl` points at the latter. |
| Reason | Migrations use advisory locks and long-lived transactions that PgBouncer transaction-mode pooling cannot carry; running `migrate` through the pooled endpoint fails intermittently. Runtime queries still benefit from pooling. |
| Impact | `prisma/schema.prisma` datasource; `config/env.ts`; `.env` / `.env.example`; `25`; deployment (`24`) must set both. |
| Priority | P0 |

## ADR-033 — Database host: Neon managed PostgreSQL

| | |
|---|---|
| Ambiguity | ADR-001 chose PostgreSQL but not where it runs during development. |
| Decision | **Neon** managed PostgreSQL (18.6) for both development and production, rather than a local instance. |
| Reason | Local PostgreSQL credentials were unavailable; Neon requires no local setup, and `24` already required a managed database for production — using it now makes dev and prod identical and removes provisioning work from Phase 13 (OPS-010). |
| Impact | `DATABASE_URL`/`DIRECT_URL`; `24` deployment; Phase 13 reduced to configuring the existing database. |
| Priority | P0 |
| Notes | Free-tier computes suspend after ~5 minutes idle, so the first request after a pause takes a few seconds. A separate Neon **branch** is recommended for production rather than sharing one database with local development. The project also provisions a `neon_auth` schema by default; it is unused by this application and left untouched. |

## ADR-034 — Prisma version pinned to 6.19.3

| | |
|---|---|
| Ambiguity | Prisma's `latest` npm tag is `8.0.0-rc.12`, a release candidate; `7.10.0` is stable-latest. |
| Decision | Pin **`prisma@6.19.3`** and **`@prisma/client@6.19.3`**. |
| Reason | Never ship a release candidate. Prisma 7 changed generator output paths and config conventions, which would cost debugging time for no assessment benefit. 6.19.3 has the deepest body of working documentation and known-good Neon behaviour. |
| Impact | `server/package.json`. |
| Priority | P0 |
| Known issue | `prisma@6.19.3` pulls `@prisma/config` → `deepmerge-ts@7.1.5`, which carries a **high** advisory (GHSA-ggr8-5vv4-36mx, stack exhaustion on recursive object graphs). It is a **dev-only CLI dependency** — not imported by `@prisma/client` and never present in the deployed runtime. `npm audit fix --force` would downgrade to `prisma@6.12.0`; `prisma@7.10.0` still depends on `deepmerge-ts@7.1.5`, so upgrading does not resolve it. Accepted with rationale; revisit when a patched `@prisma/config` ships. |

## ADR-035 — Project name: Filox

| | |
|---|---|
| Ambiguity | The assessment brief calls the system "Managing Your Files", which is a description rather than a product name. |
| Decision | Product name is **Filox**. The repository and documentation continue to reference the assessment title where they describe the brief. |
| Reason | Owner's decision. A short distinct name is better for UI branding, page titles, and the README. |
| Impact | `package.json` names, UI branding (Phase 7+), README, page metadata. Does not change any requirement, endpoint, or data model. |
| Priority | P0 |

## Decision summary table

| ADR | Topic | Decision | Priority |
|---|---|---|---|
| 001 | Database | PostgreSQL 16 | P0 |
| 002 | File/batch size | 10MB / 5 files / 50MB | P0 |
| 003 | Allowed types | txt md csv json pdf docx png jpg jpeg webp | P0 |
| 004 | Storage | Local disk via StorageService | P0 |
| 005 | Extraction scope | text/json/pdf/docx; images none; 20k cap | P0/P1 |
| 006 | Extraction failure | Never fails upload; status FAILED | P0 |
| 007 | JWT | HS256, 7d, {sub,role,tokenVersion} | P0 |
| 008 | Token storage | httpOnly Secure SameSite=None cookie | P0 |
| 009 | Logout | Clear cookie | P0 |
| 010 | OTP | 6-digit, 10min, hashed, 5 attempts, resend limits | P0 |
| 011 | Email | Nodemailer/Gmail + console fallback | P0 |
| 012 | Pagination | offset, default 10, max 100 | P0 |
| 013 | Deletion | Hard delete + cascade | P0 |
| 013b | Soft delete | Bonus | P2 |
| 014 | Charts | Recharts | P0 |
| 015 | Duplicates | Allowed; store checksum | P0/P2 |
| 016 | Filenames | UUID on disk, originalName in DB | P0 |
| 017 | Validation | Zod both sides | P0 |
| 018 | Password hash | bcrypt cost 12 | P0 |
| 019 | Admin seed | Idempotent seed from env | P0 |
| 020 | Admin self-protect | No self delete/demote | P0 |
| 021 | CSRF | SameSite=None + custom header + strict CORS | P1 |
| 022 | Refresh tokens | Not in MVP | P2 |
| 023 | Download/preview | Auth stream route | P1 |
| 024 | Search/filter/sort | Defined semantics | P0 |
| 025 | Response envelope | success/data/meta / error | P0 |
| 026 | Health | GET /health | P1 |
| 027 | API prefix | /api | P0 |
| 028 | JSON body limit | 100 KB | P0 |
| 029 | Env loading | Node `--env-file-if-exists`, no dotenv | P0 |
| 030 | Request logging | local middleware, no morgan | P1 |
| 031 | JWT_SECRET length | ≥32 chars enforced at boot | P0 |
| 032 | Migration connection | separate `DIRECT_URL` (unpooled) | P0 |
| 033 | Database host | Neon managed PostgreSQL 18 | P0 |
| 034 | Prisma version | pinned 6.19.3 (not 8.x RC) | P0 |
| 035 | Project name | **Filox** | P0 |
