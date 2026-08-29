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

## ADR-004 — Storage strategy *(superseded by ADR-039)*

| | |
|---|---|
| Ambiguity | Storage location unspecified. |
| Original decision | **Local disk** at `server/uploads/` in MVP, accessed only through a `StorageService` abstraction. Stored filename a generated UUID; original name kept in DB. |
| Reason | Zero external setup for an 8–10h build. Abstraction allows a later swap without touching controllers. |
| Status | **Superseded during Phase 5 by ADR-039 (Cloudinary).** The `StorageService` abstraction this ADR introduced is what made the swap a one-file change — it did its job. |
| Retained | Opaque generated storage key, never the client filename (ADR-016); all blob access through authorized routes. |
| Priority | P0 |

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

## ADR-036 — `POST /auth/logout` is public and idempotent

| | |
|---|---|
| Ambiguity | `11` lists logout at auth level "User", implying it requires a valid token. |
| Decision | **Public.** It always clears the cookie and always returns 200. |
| Reason | Requiring `authenticate` creates a dead end: once the token expires the endpoint returns 401 and the cookie is never cleared, so the browser keeps sending a stale cookie until it expires on its own. Clearing a cookie the caller already holds grants no capability, so there is nothing to protect. |
| Impact | `auth.routes.ts` omits `authenticate` on logout; `11` and `12` diverge from the original "User" level; the frontend can call logout unconditionally. |
| Priority | P0 |

## ADR-037 — Auth rate limit value

| | |
|---|---|
| Ambiguity | `20` §9 requires rate limiting on auth routes but names no threshold; `env.RATE_LIMIT_MAX` defaults to 100. |
| Decision | **20 requests per IP per 15-minute window** on `/auth/register`, `/verify-email`, `/resend-code`, `/login`. `env.RATE_LIMIT_MAX` remains for a future general-purpose limiter. Skipped when `NODE_ENV=test`. |
| Reason | 100 login attempts per 15 minutes is not a meaningful brake on credential stuffing; 20 is, while still tolerating a user who mistypes a password a few times and requests a couple of codes. Disabling it under test prevents one suite of auth cases from tripping the limiter and cascading failures. |
| Impact | `constants.ts` `AUTH_RATE_LIMIT_MAX`; `middleware/rateLimit.ts`. `/auth/profile` is excluded — it already requires a token. |
| Priority | P1 |
| Note | In-memory store. Effective for a single dyno only; horizontal scaling would need a shared store. |

## ADR-038 — Superseded verification codes are consumed, not deleted

| | |
|---|---|
| Ambiguity | ADR-010 requires that issuing a new OTP invalidates prior ones; the mechanism was unspecified. |
| Decision | Prior codes are marked `consumedAt`, **not** deleted. |
| Reason | The hourly resend cap counts rows by `createdAt`. Deleting superseded codes would erase that history and silently defeat the limit — a caller could resend indefinitely. |
| Impact | `auth.repository.consumeAllActiveCodes`; `VerificationCode` rows accumulate (bounded by the resend cap and removed by user-delete cascade). |
| Priority | P0 |

## ADR-039 — Storage provider: Cloudinary (supersedes ADR-004)

| | |
|---|---|
| Ambiguity | ADR-004 accepted local-disk storage knowing free dynos have ephemeral disk, i.e. uploads disappear on every redeploy. |
| Decision | Blobs are stored in **Cloudinary** (`cloudinary@2.11.0`), reached only through the existing `StorageService`. `File.storageKey` holds the Cloudinary `public_id`. |
| Reason | Removes the single worst known risk in the project: uploaded files surviving a redeploy. A demo where files vanish is worse than one with fewer features. Free tier (25 GB) is ample, the SDK is CommonJS so the module system is unaffected, and ADR-004's abstraction means only `StorageService` changes. |
| Impact | New `cloudinary` dependency; `StorageService` upload/stream/destroy; `config/cloudinary.ts`; `CLOUDINARY_*` env vars (`25`); `13` pipeline; `24` deployment (ephemeral-disk section removed); `01` §17 limitations. |
| Priority | P0 |

### Why not `multer-storage-cloudinary`

Rejected for two independent reasons:

1. **It inverts the security model.** That storage engine streams each file to Cloudinary *during multipart parsing*, before application code runs. Every control in `13` and `20` §5 — extension, declared MIME, and magic-byte agreement — depends on inspecting the buffer **before** it is persisted. With that package a MIME-spoofed executable would already be in the account before `fileFilter` could reject it.
2. **It is unmaintained.** Last published June 2022, written for multer 1.x; the project uses multer 2.3.0.

`multer.memoryStorage()` is retained so validation and extraction both operate on the in-memory buffer, and only the storage destination changes.

### Access control

Uploads use Cloudinary `type: "authenticated"`, and raw Cloudinary URLs are **never** returned by the API. Downloads and previews continue to flow through `GET /files/:id/download`, where `authenticate` plus the ownership check run first. Returning a public URL would silently defeat FILE-015 by making any blob readable by anyone holding the link.

## ADR-040 — Module system stays CommonJS; ESM-only libraries pinned to CJS majors

| | |
|---|---|
| Ambiguity | `file-type@22` and `pdf-parse@2` are pure ESM; the backend is CommonJS (`tsconfig` `"module": "commonjs"`). |
| Decision | **Remain CommonJS.** Pin **`file-type@16.5.4`** and **`pdf-parse@1.1.4`**, the last CJS majors. |
| Reason | Converting to ESM means adding explicit `.js` extensions to roughly 70 relative imports across 26 verified files, moving to `nodenext`, and losing `__dirname` — 30–45 minutes of mechanical change with real regression risk, in a project already over its time budget. The entire benefit is newer majors of one library. `file-type@16` detects all ten allowed types; magic-byte signatures for PNG/JPEG/WebP/PDF/DOCX have been stable for over a decade. `mammoth` is CommonJS either way. |
| Impact | `package.json` version pins. |
| Priority | P0 |
| Revisit | An ESM migration is reasonable **after** all P0 features work, as a separate commit where a mistake costs nothing. |

## ADR-041 — `uuid` dependency dropped

| | |
|---|---|
| Ambiguity | `32` Step 6 listed `uuid` as a dependency for generating storage keys. |
| Decision | Use Node's built-in **`crypto.randomUUID()`**. No `uuid` package. |
| Reason | Available natively since Node 14.17; the project requires Node 20+. An external dependency for one function call is unjustified (anti-overengineering rule 11). |
| Impact | `32` Step 6 dependency list corrected. |
| Priority | P0 |

## ADR-042 — Zero-byte uploads rejected

| | |
|---|---|
| Ambiguity | `29` EC-059 says reject empty files, but no ADR stated it and `18` lists no minimum size. |
| Decision | Files of **0 bytes are rejected** with `ERR_VALIDATION` and reported in the upload response's `failed[]`. |
| Reason | An empty file has no content to extract and no value to store; it would appear as a 0 B row with null extracted content. Confirms EC-059. |
| Impact | Upload validation in `files.service`; `18` gains a minimum-size rule. |
| Priority | P0 |

## Decision summary table

| ADR | Topic | Decision | Priority |
|---|---|---|---|
| 001 | Database | PostgreSQL 16 | P0 |
| 002 | File/batch size | 10MB / 5 files / 50MB | P0 |
| 003 | Allowed types | txt md csv json pdf docx png jpg jpeg webp | P0 |
| 004 | Storage | ~~Local disk via StorageService~~ → superseded by 039 | P0 |
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
| 036 | Logout auth level | public + idempotent | P0 |
| 037 | Auth rate limit | 20 per IP / 15 min | P1 |
| 038 | Superseded OTPs | consumed, not deleted | P0 |
| 039 | **Storage provider** | **Cloudinary via StorageService** (supersedes 004) | P0 |
| 040 | Module system | CommonJS; file-type@16, pdf-parse@1 | P0 |
| 041 | UUID generation | built-in `crypto.randomUUID()` | P0 |
| 042 | Zero-byte files | rejected | P0 |
