# 06 — Non-Functional Requirements

Realistic targets for an 8–10 hour assessment. IDs are canonical in `02` §7; this document adds targets, verification, and priority. Over-engineered enterprise NFRs are deliberately excluded.

## Security (NFR-001/002/003)

| ID | Requirement | Target | Verify | Priority |
|---|---|---|---|---|
| NFR-001 | Password hashing | bcrypt cost 12; never log/return hashes | code review + test that response omits password | P0 |
| NFR-002 | Auth transport | JWT in httpOnly Secure SameSite=None cookie; all protected routes enforce | test 401 without cookie | P0 |
| NFR-003 | Upload safety | ext+MIME+magic-byte agreement; UUID storage names; size caps | tests: spoofed MIME rejected, traversal impossible | P0 |
| NFR-003a | Secrets | only via env; none committed | `.gitignore` + review | P0 |
| NFR-003b | RBAC | server-side on every admin/owner action | rbac + ownership tests | P0 |

Full threat/control detail in `20`.

## Performance (NFR-004/005)

| ID | Requirement | Target | Verify | Priority |
|---|---|---|---|---|
| NFR-004 | API latency | typical reads < 300 ms at assessment volume | manual timing | P1 |
| NFR-005 | Query efficiency | all list endpoints paginated + indexed; no full-table scan on hot paths | review Prisma queries + indexes (`09`) | P0 |
| NFR-004a | Upload responsiveness | progress visible; extraction non-blocking to response only in that it runs before response but is bounded by 20k cap | manual | P1 |
| NFR-004b | Frontend | code-split routes; charts lazy where reasonable | Lighthouse spot-check | P2 |

## Scalability

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-013 | Stateless API | horizontally scalable (JWT, no server session) | P1 |
| — | Storage | abstracted `StorageService` allows swap to object storage | P1 |

Not in scope: multi-region, sharding, queues, caching layers (P3).

## Maintainability (NFR-009)

| Requirement | Target |
|---|---|
| Layered modular monolith | controllers→services→repositories per module (`15`) |
| Type safety | strict TypeScript both apps; shared DTO/types; Zod inference |
| Reuse | reusable UI components + hooks (`14`); shared validation shapes |
| Consistency | ESLint + Prettier; consistent naming (`33`) |

## Availability & Reliability (NFR-010/013)

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-010 | Upload consistency | no orphaned DB rows or blobs on failure; cleanup on error | P0 |
| NFR-013 | Liveness | `/health` endpoint for platform probes | P1 |
| — | Graceful errors | no unhandled promise crashes; central error middleware | P0 |

Uptime SLAs are out of scope (single managed dyno acceptable).

## Usability (NFR-006)

| Requirement | Target |
|---|---|
| Async states | every async view has loading, empty, and error states |
| Feedback | toast notifications for success/error of mutations |
| Forms | inline validation messages; disabled submit while pending |
| Navigation | clear nav; redirect on auth changes |

## Accessibility (NFR-008)

| Requirement | Target | Priority |
|---|---|---|
| Semantics | semantic HTML, labelled inputs, button roles | P1 |
| Keyboard | focus states, dialog focus trap, escape to close | P1 |
| Contrast | WCAG AA contrast on text/controls | P1 |
| Motion | respect `prefers-reduced-motion` for Framer Motion | P2 |

## Responsiveness (NFR-007)

| Requirement | Target |
|---|---|
| Breakpoints | mobile (≤640), tablet (641–1024), desktop (>1024) |
| Layout | tables collapse to cards on mobile; dropzone usable on touch |
| Verify | manual device-emulation check on key pages | 

Priority P0.

## Observability (NFR-011)

| Requirement | Target | Priority |
|---|---|---|
| Logging | structured request + error logs (method, path, status, ms) | P1 |
| Errors | server logs stack; client sees safe message | P0 |
| Health | `/health` | P1 |

APM/tracing/metrics dashboards are out of scope (P3).

## Data integrity (NFR-012)

| Requirement | Target |
|---|---|
| Constraints | unique email + storageKey; FK constraints |
| Cascades | user delete cascades files + codes (ADR-013) |
| Validation | authoritative server validation before persistence |

Priority P0.

## Summary — NFR priority

| Priority | NFRs |
|---|---|
| P0 | 001, 002, 003(+a/b), 005, 006, 007, 010, 012 |
| P1 | 004(+a), 008, 009, 011, 013 |
| P2 | 004b, motion |
| P3 | multi-region, sharding, APM, uptime SLA |
