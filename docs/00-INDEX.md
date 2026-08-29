# Documentation Index â€” Managing Your Files

Single source of truth for **Filox** — the "Managing Your Files" full-stack assessment (ADR-035).
No application code lives in this directory. Implementation follows `27-Development-Phases.md` and `32-Implementation-Plan.md`.

## Project identity

| Attribute | Value |
|---|---|
| Product name | **Filox** |
| Assessment title | Managing Your Files |
| Repository layout | `client/` (Next.js) + `server/` (Express) + `docs/` |
| Assessment budget | 8â€“10 hours focused work |
| Submission deadline | 10 days from assignment receipt |
| Author | Mohand Hatem |

## Reading order

| Order | Purpose | Files |
|---|---|---|
| 0 | **Read first â€” implementation governance** | `PROJECT-RULES.md` |
| 1 | Understand scope and decisions | `30`, `01`, `02` |
| 2 | Understand the data and contract | `09`, `10`, `11` |
| 3 | Understand the mechanics | `12`, `13`, `18`, `19`, `20`, `21` |
| 4 | Understand the code shape | `14`, `15`, `16`, `17` |
| 5 | Build it | `26`, `27`, `32` |
| 6 | Prove it | `23`, `28`, `29`, `33`, `35` |

## Full file list

| File | Title | Role |
|---|---|---|
| `01-PRD.md` | Product Requirements Document | Product scope, personas, MVP boundary |
| `02-SRS.md` | Software Requirements Specification | **Canonical requirement ID registry** |
| `03-Business-Flow.md` | Business Flow | End-to-end lifecycles incl. failures |
| `04-User-Flows.md` | User Flows | Guest / User / Admin flows, Mermaid |
| `05-Functional-Requirements.md` | Functional Requirements | Per-feature detail sheets |
| `06-Non-Functional-Requirements.md` | Non-Functional Requirements | Realistic NFR targets |
| `07-Use-Cases.md` | Use Cases | Formal use-case specs |
| `08-Roles-and-Permissions.md` | Roles & Permissions | Permission matrix, enforcement layers |
| `09-Database-Design.md` | Database Design | Fields, constraints, indexes, rationale |
| `10-ERD.md` | ERD | Mermaid ERD + relationship explanations |
| `11-API-Specification.md` | API Specification | **Canonical REST contract** |
| `12-Authentication-Flow.md` | Authentication Flow | Registration â†’ OTP â†’ JWT â†’ RBAC |
| `13-File-Upload-Architecture.md` | File Upload Architecture | Upload pipeline and extraction |
| `14-Frontend-Architecture.md` | Frontend Architecture | App Router design, RSC/CSC split |
| `15-Backend-Architecture.md` | Backend Architecture | Modular monolith layers |
| `16-Folder-Structure.md` | Folder Structure | Directory responsibilities |
| `17-React-Query-Strategy.md` | React Query Strategy | Query keys, caching, invalidation |
| `18-Validation-Rules.md` | Validation Rules | FE advisory / BE authoritative |
| `19-Error-Handling.md` | Error Handling | Error taxonomy and codes |
| `20-Security-Requirements.md` | Security Requirements | Threats and controls |
| `21-Statistics-Requirements.md` | Statistics Requirements | Exact calculation logic |
| `22-Admin-Requirements.md` | Admin Requirements | Admin surface and guardrails |
| `23-Testing-Strategy.md` | Testing Strategy | Prioritised test plan |
| `24-Deployment-Architecture.md` | Deployment Architecture | Vercel + Render + Neon |
| `25-Environment-Variables.md` | Environment Variables | Every variable documented |
| `26-Task-Breakdown.md` | Task Breakdown | Engineering backlog with IDs |
| `27-Development-Phases.md` | Development Phases | **Phase-by-phase roadmap** |
| `28-Acceptance-Criteria.md` | Acceptance Criteria | Given/When/Then per P0 |
| `29-Edge-Cases.md` | Edge Cases | Expected behaviour catalogue |
| `30-Assumptions-and-Decisions.md` | Assumptions & Decisions | **Canonical decision log (ADR-xxx)** |
| `31-Requirements-Traceability-Matrix.md` | Traceability Matrix | Company requirement â†’ artefacts |
| `32-Implementation-Plan.md` | Implementation Plan | Ordered build blueprint |
| `33-Definition-of-Done.md` | Definition of Done | Completion gates |
| `34-README.md` | README Specification | Spec for the root `README.md` |
| `35-Final-Submission-Checklist.md` | Submission Checklist | Pre-submit verification |
| `PROJECT-RULES.md` | Project Rules | **Binding implementation governance** â€” approval gates, anti-overengineering, protocol |

## Authority rules

`PROJECT-RULES.md` governs **how** implementation proceeds (gates, protocol, anti-overengineering) and is binding during the build.

For **content** disagreements between documents, the higher authority wins:

1. `30-Assumptions-and-Decisions.md` â€” decisions (ADR IDs)
2. `11-API-Specification.md` â€” API contract shapes
3. `09-Database-Design.md` â€” data model
4. `02-SRS.md` â€” requirement IDs and priorities
5. Everything else â€” derived detail

## ID conventions

| Prefix | Meaning | Defined in |
|---|---|---|
| `AUTH-nnn` | Authentication / authorization requirement | `02-SRS.md` |
| `FILE-nnn` | File management requirement | `02-SRS.md` |
| `USER-nnn` | User profile / user admin requirement | `02-SRS.md` |
| `ADMIN-nnn` | Admin-only requirement | `02-SRS.md` |
| `STAT-nnn` | Statistics requirement | `02-SRS.md` |
| `NFR-nnn` | Non-functional requirement | `06-Non-Functional-Requirements.md` |
| `UC-nnn` | Use case | `07-Use-Cases.md` |
| `AC-nnn` | Acceptance criterion | `28-Acceptance-Criteria.md` |
| `EC-nnn` | Edge case | `29-Edge-Cases.md` |
| `ADR-nnn` | Architecture decision | `30-Assumptions-and-Decisions.md` |
| `BE-*` / `FE-*` / `DB-*` / `OPS-*` / `QA-*` | Task IDs | `26-Task-Breakdown.md` |
| `ERR_*` | API error codes | `19-Error-Handling.md` |

## Priority scale

| Priority | Meaning | Rule |
|---|---|---|
| **P0** | Mandatory. Explicitly required by the company. | Must ship. Non-negotiable. |
| **P1** | Important. Strongly implied or needed for quality. | Ship if P0 is complete. |
| **P2** | Bonus. Listed as optional by the company. | Only with spare time. |
| **P3** | Out of scope for this assessment. | Do not build. Documented for completeness. |
