# PROJECT RULES — Filox (Managing Your Files)

**Status:** Active · **Scope:** governs the entire implementation phase · **Authority:** binding on every implementation step.

> **Product name: Filox** (ADR-035). "Managing Your Files" remains the assessment title used when referring to the company brief.

This document is the permanent implementation governance contract. Once implementation begins, every step must follow it. It cannot be bypassed for convenience or speed.

### Gate sequence (per phase)

```text
PHASE START REVIEW GATE   (present phase definition from `27` → approval)
        ↓
§4  Implementation Gate    (full step proposal — per step)
        ↓
§5  Code Approval Gate     (explicit approval — per step)
        ↓
    write code → verify → report
        ↓
§17 Phase Completion Gate  (phase summary → approval to move on)
```

---

## 1. Project Context

### Purpose

Build **Filox** — a full-stack file management system where authenticated users upload and manage their own files, and administrators manage all users and files and monitor system usage. Delivered against the company's "Managing Your Files" assessment brief.

### Company assessment

This is a Full Stack Developer hiring assessment. The company's brief is the ultimate business source of truth. It mandates a fixed technology stack, an explicit feature list, three deliverables (GitHub repo, hosted frontend, hosted backend + README), and states the work is designed for **8–10 hours of focused effort** with a 10-day submission deadline.

### Technologies (fixed by the company)

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, TanStack React Query, Axios.
**Backend:** Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT authentication, Multer.
**Approved additions (documented in `30`):** Zod (validation), bcrypt (hashing), Nodemailer (OTP email), Recharts (charts, ADR-014 — reviewer-approved), `file-type` (magic-byte validation), `pdf-parse` + `mammoth` (content extraction), Vitest + Supertest (tests).

### Users

- **Guest** — can register, verify email, resend code, log in.
- **User** (`role = USER`) — verified account; uploads and manages **only their own** files; views own statistics and profile.
- **Admin** (`role = ADMIN`) — everything a user can do, plus manage all users (list/search/role/delete) and all files (list/search/filter/paginate/delete), plus system statistics. Seeded from environment variables.

### Main business flows

1. **Registration lifecycle** — register → OTP generated + emailed → verify → account activated → login → authenticated session.
2. **File lifecycle** — upload → validate → store → extract content → persist metadata → list/search/filter/sort/paginate → view details → delete.
3. **Admin lifecycle** — login → admin authorization → dashboard → user management → file management → statistics.

### MVP

The MVP is exactly the **P0** requirement set in `02-SRS.md`: complete authentication with OTP and RBAC; file upload (single, multiple, drag-and-drop, progress, validation) with storage, metadata and content extraction; My Files with search, filter, sort, pagination, details and delete, all ownership-scoped; user statistics dashboard; admin user management, all-files management and admin statistics; responsive UI with loading/empty/error states and toasts; deployed frontend, backend and database; complete README.

---

## 2. Source of Truth

```text
Company Assessment          ← ultimate BUSINESS source of truth
        ↓
PRD (01) / SRS (02)         ← requirement IDs and priorities
        ↓
Architecture (14, 15, 09, 11)
        ↓
Requirements Traceability (31)   ← WHAT
        ↓
Development Phases (27)          ← WHEN
        ↓
Implementation Plan (32)         ← HOW
        ↓
Code
```

- The **company assessment** is the ultimate business source of truth. No company requirement may be removed, reduced, or silently reinterpreted.
- The **documentation package** is the technical source of truth. Code must follow approved documentation.
- If code and documentation diverge, the documentation is corrected first (through the change-management process in §14), then the code follows.

### Document authority order

When documents disagree, higher authority wins:

1. `30-Assumptions-and-Decisions.md` — decisions (ADR IDs)
2. `11-API-Specification.md` — API contract shapes
3. `09-Database-Design.md` — data model
4. `02-SRS.md` — requirement IDs and priorities
5. All other documents — derived detail

---

## 3. Anti-Overengineering Rule

This is a **permanent project rule**. The project is a time-limited technical assessment.

### DO NOT OVER-ENGINEER.

Always prefer:

> The simplest reliable, secure, maintainable, and production-appropriate solution that completely satisfies the requirement.

### The twenty rules

1. Implement the requirement, not an imagined future product.
2. Do not introduce abstractions unless they provide clear value.
3. Do not create unnecessary layers, wrappers, factories, managers, or generic systems.
4. Do not introduce design patterns merely for the sake of using design patterns.
5. Do not use microservices.
6. Do not introduce event-driven architecture unless genuinely required.
7. Do not introduce message brokers unless genuinely required.
8. Do not introduce CQRS unless genuinely required.
9. Do not introduce queues, workers, cron jobs, background processing, or distributed systems unless the requirement actually needs them.
10. Do not introduce Redux or another state-management solution when React Query, local state, or Context is sufficient.
11. Do not introduce unnecessary third-party libraries.
12. Do not build infrastructure for hypothetical future requirements.
13. Do not optimize prematurely.
14. Do not create abstractions for code used only once unless there is a clear architectural reason.
15. Prefer readable code over clever code.
16. Prefer straightforward solutions over highly generic solutions.
17. Keep database design simple while maintaining correctness, security, and appropriate scalability.
18. Keep API design simple and RESTful.
19. Keep frontend architecture feature-oriented and easy to understand.
20. Never implement bonus features before P0 requirements are complete.

### Decision Rule

Before introducing any non-trivial dependency, abstraction, architecture pattern, service, infrastructure, or technology, answer:

```text
What requirement does this solve?
Is it required for the MVP?
Can the existing stack solve it?
What complexity does it add?
Is that complexity justified for this 8–10 hour assessment?
```

If the answer is not clearly justified: **DO NOT INTRODUCE IT.**

### Simplicity Principle

The best solution is NOT the most sophisticated solution. The best solution is:

> The simplest reliable, secure, maintainable, and production-appropriate solution that fully satisfies the requirement.

If a more advanced approach is technically interesting but unnecessary for the assessment: do not implement it; mention it only as a possible future improvement.

### Already-applied anti-overengineering decisions

These are locked and must not be reversed without approval: no Redux (React Query + local state + Context only); no microservices (modular monolith); no refresh tokens in MVP (ADR-022); no message queues or background workers (extraction is inline and bounded); offset pagination not cursor (ADR-012); blob storage behind a thin `StorageService` — Cloudinary, no `multer-storage-cloudinary` because it would store files before validation runs (ADR-039); CommonJS module system, ESM deferred until after P0 (ADR-040); no materialised views or caching for statistics (`21`); no OCR (ADR-005).

---

# PHASE START REVIEW GATE

> **Gate order:** this gate fires **before** the Implementation Gate (§4) and the Code Approval Gate (§5). Sequence per phase: **Phase Start Review Gate → §4 Implementation Gate (per step) → §5 Code Approval Gate (per step) → §17 Phase Completion Gate**.

At the beginning of **EVERY phase**, before implementing any code, the AI MUST read the exact definition of the current phase from:

`docs/27-Development-Phases.md`

For the current phase, the AI MUST show:

* Phase number and name
* Phase goal
* Area: Frontend / Backend / Database / DevOps / QA / Both
* Priority
* Dependencies
* Estimated time
* Number of steps
* All steps included in the phase
* Files/components involved
* APIs involved
* Database changes
* Security considerations
* Testing requirements
* Acceptance criteria
* Definition of Done

Then explain briefly:

* What this phase is responsible for
* Why this phase exists
* Why its position in the implementation order is correct
* How it depends on previous phases
* How it contributes to the overall project

## STRICT RULE

Do NOT write any code at this stage.

Do NOT create or modify implementation files.

Do NOT install dependencies.

Do NOT automatically start Step 1.

After presenting the complete phase definition and explanation, STOP and ask:

> "This is the approved definition of Phase X according to `docs/27-Development-Phases.md`. Would you like me to proceed to Step 1?"

Only after explicit approval may Step 1 begin.

Once approval to proceed to Step 1 is given, follow the **Step Implementation Gate** already defined in this document (§4 Implementation Gate, then §5 Code Approval Gate).

## CONSISTENCY RULE

The phase definition shown must come directly from:

`docs/27-Development-Phases.md`

Do not silently redesign, reorder, merge, remove, or add phase steps.

If a change is believed necessary:

1. Explain the proposed change.
2. Explain why it is necessary.
3. Explain its impact on requirements, dependencies, scope, and timeline.
4. Ask for approval.
5. Only after approval, update the documentation.
6. Then proceed.

(This is the same discipline as §14 Change Management, applied at phase granularity.)

## ANTI-OVERENGINEERING CHECK

Before proceeding from the phase review to Step 1, verify that the phase does not introduce unnecessary:

* dependencies
* abstractions
* architecture
* infrastructure
* design patterns
* services
* background processing
* libraries

Prefer the simplest reliable solution that satisfies the project's requirements and the 8–10 hour assessment constraint. Apply the Decision Rule and Simplicity Principle from §3.

## IMPORTANT

This rule applies to **EVERY phase**, not only Phase 1.

```text
Phase 1  → show Phase 1 definition  → ask approval → Step 1
Phase 2  → show Phase 2 definition  → ask approval → Step 1
Phase 3  → show Phase 3 definition  → ask approval → Step 1
Phase 4  → show Phase 4 definition  → ask approval → Step 1
Phase 5  → show Phase 5 definition  → ask approval → Step 1
Phase 6  → show Phase 6 definition  → ask approval → Step 1
Phase 7  → show Phase 7 definition  → ask approval → Step 1
Phase 8  → show Phase 8 definition  → ask approval → Step 1
Phase 9  → show Phase 9 definition  → ask approval → Step 1
Phase 10 → show Phase 10 definition → ask approval → Step 1
Phase 11 → show Phase 11 definition → ask approval → Step 1
Phase 12 → show Phase 12 definition → ask approval → Step 1
Phase 13 → show Phase 13 definition → ask approval → Step 1
Phase 14 → show Phase 14 definition → ask approval → Step 1   (final phase — same process)
```

No phase is exempt. The gate is not waived for short phases, familiar phases, or phases that appear trivial.

---

## 4. Implementation Gate

> Precondition: the **Phase Start Review Gate** above has been completed and approval to proceed to Step 1 was given.

For every phase and every significant implementation step:

### NEVER jump directly to coding.

Before writing code, a detailed implementation proposal must be presented containing **all** of the following sections.

#### Proposal template

```text
Step ID:            PHASE-03-STEP-02
Step Name:          <short name>
Area:               Frontend | Backend | Database | DevOps | QA | Both

Objective:          What this step accomplishes.
What We Will Build: Concrete functionality.

Technologies / Libraries:  Exact technologies and libraries.
Why We Use Them:           Why each important technology is appropriate.

Business Logic:     Business rule, expected behavior, reasoning.
Roles:              User permissions, Admin permissions, other roles.

Data Flow:          e.g. User → Frontend → API → Controller → Service → Repository → Database
                    (use the architecture relevant to that step)

Files to Create:    All new files.
Files to Modify:    All existing files.
Dependencies:       What must already exist.

API:                Affected endpoints.
Database:           Affected entities / fields / relations / indexes / migrations.
Validation:         Validation rules.
Security:           Security considerations.
Error Handling:     Expected failures and behavior.
Testing:            How the step will be verified.
Acceptance Criteria: Given / When / Then where useful.

Why This Is Recommended:  Why this is the best fit for this project.
Overengineering Check:    Does this step introduce unnecessary complexity?
                          If yes, how can it be simplified?
```

A proposal missing any section is incomplete and must not proceed.

---

## 5. Code Approval Gate

After presenting the implementation proposal:

### DO NOT WRITE CODE YET.

Show the proposed code structure and implementation approach, then ask explicitly:

> Do you approve this implementation approach and code plan for Step X?

Then **WAIT**.

Only after explicit approval may code be written. Accepted approval phrases: `Approved`, `Yes`, `Go ahead`, `Implement it`, `Proceed`.

If approval is not explicitly provided: **DO NOT CODE.**

---

## 6. No Assumption Without Approval

If a new ambiguity appears during implementation:

1. Explain the ambiguity.
2. Explain the recommended option.
3. Explain alternatives where relevant.
4. Explain the impact.
5. Ask for approval.
6. Update the documentation (normally a new ADR in `30`) after approval.
7. Only then implement.

Never silently make architectural decisions that materially affect the project.

---

## 7. No Undocumented Technologies

Do not introduce significant technologies or libraries without justification. For any new dependency, document:

```text
Dependency
Why needed
Alternative
Why this choice is better
Complexity added
Impact
```

If the dependency materially affects architecture or scope, ask for approval before using it. Pin versions; prefer well-maintained packages; verify the package name is not a typosquat.

The approved dependency list is in §1. Anything beyond it requires this process.

---

## 8. Scope Control

Priority order is absolute:

```text
P0 → P1 → P2 → P3
```

| Priority | Meaning | Rule |
|---|---|---|
| **P0** | Mandatory — explicitly required by the company | Must ship |
| **P1** | Important — needed for quality/security depth | Only after all P0 complete |
| **P2** | Bonus — company-listed optional | Only with genuine spare time |
| **P3** | Out of scope | Do not build |

- Never sacrifice a P0 requirement for an optional feature.
- Never expand scope without approval.
- P2 and P3 features must **never** block P0 work.
- If time pressure appears, cut P1/P2 — never P0.

---

## 9. Frontend Rules

Use: Next.js App Router · TypeScript · Tailwind CSS · Framer Motion · TanStack React Query · Axios · Recharts.

- Reusable UI components in `components/ui/`; feature-scoped composites in `features/`.
- Reusable hooks in `hooks/`; typed API wrappers in `services/`.
- Feature-oriented organisation (see `16`).
- Appropriate Server/Client Component separation (see `14`): static shells as Server Components; data-fetching and interactive views as Client Components.
- Consistent **loading / error / empty** states on every async view.
- Toast notifications for mutation outcomes.
- Responsive design across mobile / tablet / desktop.
- Accessibility basics: semantic HTML, labelled inputs, keyboard focus, AA contrast, dialog focus trap.
- Server state lives in React Query; UI state in local state; list params in the URL; auth state in `AuthProvider`.

**Do not introduce unnecessary state-management libraries.**

---

## 10. Backend Rules

Use: Express.js · TypeScript · Prisma · PostgreSQL · JWT · Multer · Zod · bcrypt · Nodemailer.

- **Modular monolith** with vertical feature modules: `auth`, `users`, `files`, `stats`.
- Layering: **routes → controllers → services → repositories** (see `15`). Controllers never contain business rules or Prisma calls; repositories never contain business rules.
- Centralised error handling (`errorHandler` + `notFound`) with the standard envelope (`19`).
- Zod validation middleware on every request that takes input; backend validation is authoritative.
- `authenticate` middleware for sessions; `authorizeRole` for RBAC; ownership checks in the files service.
- Reusable services: `TokenService`, `PasswordService`, `OtpService`, `MailService`, `StorageService`, `ExtractionService`.
- Single `PrismaClient` singleton.

**Do NOT use microservices. Do NOT create unnecessary abstractions.**

---

## 11. Database Rules

- Relational design per `09`; three entities: `User`, `VerificationCode`, `File`.
- Clear relationships with explicit foreign keys; no cycles.
- Appropriate indexes only — those justified by a real query (`09` §5).
- Unique constraints: `User.email`, `File.storageKey`.
- Referential integrity enforced by the database.
- Safe deletion rules: cascade `User → File` and `User → VerificationCode`; blobs removed by the service layer.
- **All schema changes go through Prisma migrations.** Never edit the database structure by hand.
- Never change database structure casually — a schema change requires the change-management process (§14).

---

## 12. Security Rules

Always enforce (details in `20`):

- Password hashing (bcrypt cost 12); never store, log, or return plaintext or hashes.
- JWT signed HS256 with a strong `JWT_SECRET`; verified on every protected route.
- **httpOnly, Secure, `SameSite=None` cookie** for the token (ADR-008); local dev uses `SameSite=Lax` + non-Secure.
- **Credentialed CORS** with an explicit origin allow-list — never a wildcard with credentials.
- RBAC on every admin route; ownership check on every file resource. **The backend is the security boundary; frontend guards are UX only.**
- OTP: 6 digits, hashed at rest, 10-minute expiry, max 5 verify attempts, 60s resend cooldown, max 5 resends per hour.
- Input validation on all requests (Zod), including sort-field whitelisting.
- File validation: extension **and** declared MIME **and** magic-byte sniff must agree; enforce size (10 MB/file) and count (5/request) limits.
- Filename security: store as opaque UUID; never use a client filename in a filesystem path; sanitise `originalName` for display.
- Path traversal prevention; uploads never exposed as a static directory.
- Unauthorized file access returns 403; non-existent returns 404.
- Secret management: secrets only via environment variables; `.env*` git-ignored; only `NEXT_PUBLIC_*` reaches the browser.
- Sensitive data protection: no stack traces, SQL, or secrets in API responses.
- Admin self-protection: an admin cannot delete or demote themselves.

**Do not weaken security without explaining the trade-off and getting approval.**

---

## 13. Testing Rules

Every significant feature must have verification. At minimum verify:

- happy path
- validation failure
- authentication failure
- authorization failure (role and ownership)
- edge case
- error handling

P0 features receive testing priority. The **T0** suites are mandatory before submission: auth flows, RBAC, file ownership, upload validation, admin self-protection. Tooling: Vitest + Supertest for the backend (`23`).

---

## 14. Change Management

If a requirement, architecture decision, or implementation direction needs to change:

```text
Identify Change
↓
Explain Reason
↓
Explain Impact
↓
Propose Solution
↓
Ask Approval
↓
Update Documentation
↓
Implement
```

Never silently change important decisions. Documentation is updated **before** the code.

---

## 15. Code Quality Rules

The implementation must demonstrate:

- clean, intention-revealing naming
- strong TypeScript (strict mode; avoid `any` in public interfaces)
- single responsibility per module/function
- low duplication
- reusable code where it genuinely helps
- readable functions
- meaningful comments only where they add information
- maintainable architecture
- simple solutions

Avoid clever or unnecessarily abstract code.

---

## 16. Git Rules

Use meaningful, conventional commits:

```text
feat(auth): implement email verification
feat(files): implement file upload pipeline
feat(files): add listing, search, filter and pagination
feat(admin): implement user management
fix(auth): handle expired OTP correctly
docs: record cookie-auth decision
test(files): cover ownership enforcement
```

Avoid meaningless commits (`update`, `fix`, `wip`). Commit after each verified step. Never commit secrets or `.env` files. Do not amend or force-push without explicit instruction.

---

## 17. Phase Completion Gate

At the end of **every** phase, do NOT automatically start the next phase. Provide:

### Phase Summary

- completed tasks (by task ID)
- files created
- files modified
- APIs added
- database changes
- tests executed and results
- requirements satisfied (by requirement ID)
- acceptance criteria status
- issues found
- deviations from documentation

Then perform a phase review. Then **STOP** and ask:

> Phase X is complete. Do you approve moving to Phase X+1?

Then **WAIT** for explicit approval.

---

## 18. AI Behavior

Behave like a Senior Engineer and Reviewer, not an uncontrolled code generator:

- challenge bad decisions when necessary
- identify risks early
- explain trade-offs honestly
- prefer simplicity
- maintain consistency with the documentation
- protect project scope
- preserve requirements traceability
- state what was verified and what was not

Do not block progress unnecessarily. Do not invent complexity. Do not claim something works without running it.

---

## 19. Implementation Protocol (mandatory)

For **every** significant implementation step:

```text
0.  At the start of a phase: present the full phase definition from `27` and get
    approval to proceed to Step 1 (PHASE START REVIEW GATE).
1.  Read the relevant documentation.
2.  Identify the current phase.
3.  Identify the current step.
4.  Explain exactly what will be implemented.
5.  Explain technologies and WHY they are used.
6.  Explain the business logic.
7.  Explain roles and permissions.
8.  Explain the data flow.
9.  Explain files to create/modify.
10. Explain API / database / security / testing impact.
11. Explain the proposed code structure.
12. Perform an overengineering check.
13. Ask for explicit approval.
14. WAIT.
15. Only after approval, write the code.
16. Run relevant verification.
17. Report results.
18. Ask for approval before the next significant step.
19. Ask for approval before moving to the next phase.
```

This protocol is mandatory and applies for the entire implementation phase.

---

## 20. Final Project Check

Before declaring the project complete, verify the full chain remains traceable:

```text
Company Requirements → PRD → SRS → Architecture → Phases → Tasks
→ Implementation → Tests → Deployment → README
```

Gates: `33-Definition-of-Done.md` fully satisfied for P0; `35-Final-Submission-Checklist.md` all P0 items marked Done; `31-Requirements-Traceability-Matrix.md` shows every mandatory requirement covered.

---

## 21. Approved phase order

```text
1  Scaffold                → 2  Backend Foundation   → 3  Database
4  Auth + Authorization    → 5  Files                → 6  Users (admin) + Statistics
7  Frontend Foundation     → 8  Auth UI              → 9  File UI
10 Dashboards + Admin UI   → 11 Integration          → 12 Testing (T0)
13 Deployment              → 14 Docs + Final Review
```

Dependencies and per-phase detail: `27`. Step-level instructions: `32`.

---

## 22. Quick reference — hard limits

| Limit | Value | Source |
|---|---|---|
| Max file size | 10 MB | ADR-002 |
| Max files per upload | 5 | ADR-002 |
| Max request size | 50 MB | ADR-002 |
| Allowed types | txt, md, csv, json, pdf, docx, png, jpg, jpeg, webp | ADR-003 |
| Blob storage | Cloudinary, `type: authenticated` | ADR-039 |
| Extracted text cap | 20 000 chars | ADR-005 |
| OTP length / TTL | 6 digits / 10 min | ADR-010 |
| OTP verify attempts | 5 | ADR-010 |
| OTP resend cooldown / cap | 60 s / 5 per hour | ADR-010 |
| JWT algorithm / expiry | HS256 / 7 days | ADR-007 |
| Pagination default / max | 10 / 100 | ADR-012 |
| bcrypt cost | 12 | ADR-018 |
| API base path | `/api` | ADR-027 |
| Recent uploads (admin) | 10 | `21` |
| Upload history window | 30 days | `21` |
