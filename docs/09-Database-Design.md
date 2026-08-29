# 09 — Database Design

Canonical data model. Prisma + PostgreSQL (ADR-001). No Prisma code here — this is the design that the schema will implement. The ERD is in `10`.

## 1. Entities overview

| Entity | Purpose |
|---|---|
| `User` | Account, credentials, role, verification state. |
| `VerificationCode` | Email-verification OTPs (hashed), lifecycle metadata. |
| `File` | Uploaded file metadata, storage key, extracted content. |

Enums: `Role { USER, ADMIN }`, `ExtractionStatus { PENDING, DONE, SKIPPED, FAILED }`, `FileCategory { DOCUMENT, IMAGE, TEXT, OTHER }`.

---

## 2. User

| Field | Type | Constraints | Default | Why |
|---|---|---|---|---|
| `id` | String (cuid) | PK | cuid() | Stable non-guessable identifier used in JWT `sub` and URLs. |
| `name` | String | required, 1–100 chars | — | Display name. |
| `email` | String | **unique**, required, lowercased | — | Login identity; uniqueness prevents duplicate accounts (AUTH-001). |
| `password` | String | required | — | bcrypt hash, cost 12 (ADR-018). Never returned by the API. |
| `role` | Role | required | `USER` | RBAC (AUTH-010). Admin seeded (ADR-019). |
| `isEmailVerified` | Boolean | required | `false` | Gates login (AUTH-006). |
| `tokenVersion` | Int | required | `0` | Bumped to invalidate issued JWTs on delete/role change (AUTH-013). |
| `createdAt` | DateTime | required | now() | Audit + "joined" date + stats. |
| `updatedAt` | DateTime | required, auto | now() | Change tracking. |

Relations: `files File[]`, `verificationCodes VerificationCode[]`.

Indexes:
- Unique index on `email` (lookup at login/register).
- Index on `role` (admin user filtering — small benefit, cheap).
- Index on `createdAt` (admin user sort / recent).

Deletion: deleting a `User` cascades to `File` and `VerificationCode` (ADR-013). Blobs for the user's files must be removed by the service layer before/around row deletion (DB cascade cannot delete disk files).

---

## 3. VerificationCode

| Field | Type | Constraints | Default | Why |
|---|---|---|---|---|
| `id` | String (cuid) | PK | cuid() | Identifier. |
| `userId` | String | FK → User.id, required | — | Owner of the code. |
| `codeHash` | String | required | — | bcrypt hash of the 6-digit OTP (ADR-010). Never store plaintext. |
| `expiresAt` | DateTime | required | — | now()+10min; enforces expiry (ADR-010). |
| `attempts` | Int | required | `0` | Incremented per failed verify; blocks after 5. |
| `consumedAt` | DateTime | nullable | null | Set when successfully used; prevents reuse. |
| `createdAt` | DateTime | required | now() | Cooldown + resend-rate calculations. |

Relations: `user User @relation(..., onDelete: Cascade)`.

Indexes:
- Index on `userId` (fetch latest active code).
- Index on `(userId, createdAt)` (resend-rate window queries; find newest).
- Index on `expiresAt` (optional cleanup of stale codes).

Rules:
- Only the **latest** unconsumed, unexpired code is valid; issuing a new one invalidates prior ones (implementation: mark previous consumed or delete on resend).
- Resend allowed only if newest code age ≥ 60s and < 5 codes created in the last hour (ADR-010).

---

## 4. File

| Field | Type | Constraints | Default | Why |
|---|---|---|---|---|
| `id` | String (cuid) | PK | cuid() | Identifier used in URLs. |
| `ownerId` | String | FK → User.id, required | — | Ownership boundary (FILE-015). |
| `originalName` | String | required, ≤255, sanitised | — | Display name (ADR-016). |
| `storageKey` | String | **unique**, required | — | `<uuid>.<ext>` on disk; unique prevents collisions (ADR-016). |
| `mimeType` | String | required | — | Verified MIME (ADR-003); drives preview/extraction. |
| `category` | FileCategory | required | `OTHER` | Derived group for filtering (ADR-024). |
| `extension` | String | required | — | Normalised lowercase extension. |
| `size` | Int (bytes) | required | — | Storage stats + size sort (STAT-001). BigInt not needed at ≤10MB. |
| `checksum` | String | required | — | SHA-256 hex for future dedupe (ADR-015). |
| `extractedContent` | Text | nullable | null | Extracted text ≤20k chars (ADR-005). |
| `extractionStatus` | ExtractionStatus | required | `PENDING` | Extraction outcome (ADR-006). |
| `createdAt` | DateTime | required | now() | Upload date (FILE-014), sort, history stats. |
| `updatedAt` | DateTime | required, auto | now() | Change tracking. |

Relations: `owner User @relation(..., onDelete: Cascade)`.

Indexes:
- Index on `ownerId` (user file list — the hot path, FILE-010).
- Index on `(ownerId, createdAt)` (default sort within a user).
- Index on `(ownerId, category)` (filtered list).
- Index on `createdAt` (admin recent uploads / global sort, STAT-003).
- Index on `mimeType` or `category` globally (admin top-types aggregation).
- `originalName` search uses `contains`/`ilike`; a trigram (GIN) index is a P2 optimisation — not needed at assessment volume.

---

## 5. Index summary & rationale

| Index | Serves | Requirement |
|---|---|---|
| `User.email` unique | login/register lookup | AUTH-001/005 |
| `User.createdAt` | admin sort/recent | USER-002 |
| `VerificationCode.userId` | latest code fetch | AUTH-003/004 |
| `VerificationCode.(userId,createdAt)` | resend-rate window | AUTH-004 |
| `File.ownerId` | user file list | FILE-010 |
| `File.(ownerId,createdAt)` | default sort | FILE-013 |
| `File.(ownerId,category)` | filter | FILE-012 |
| `File.createdAt` | admin recent / history | STAT-003/005 |
| `File.category` | admin type distribution | STAT-003 |

## 6. Cascading & integrity rules

| Rule | Behaviour |
|---|---|
| Delete User → Files | Cascade rows; service deletes blobs (ADR-013). |
| Delete User → VerificationCodes | Cascade. |
| Delete File | Remove row; service removes blob. |
| Unique email | DB rejects duplicates → mapped to `ERR_EMAIL_TAKEN`. |
| Unique storageKey | Prevents blob path collision. |
| FK ownerId/userId | Orphan prevention. |

## 7. Derived-data / statistics notes

- **Storage used (user)** = `SUM(File.size) WHERE ownerId = me`.
- **Total files (user)** = `COUNT(File) WHERE ownerId = me`.
- **Type distribution** = `GROUP BY category` (or mimeType) counts.
- **Upload history** = `COUNT` grouped by `date_trunc('day', createdAt)` over trailing window.
- **Admin totals** = `COUNT(User)`, `COUNT(File)`, `SUM(File.size)`, top categories, latest N files with owner join.

All aggregations are indexed on `ownerId`/`createdAt`/`category`; acceptable for assessment volume without materialised views (`21`).

## 8. Migrations

- Managed via `prisma migrate dev` locally and `prisma migrate deploy` in production (`24`).
- Seed (`prisma/seed.ts`) upserts the admin from env (ADR-019).
