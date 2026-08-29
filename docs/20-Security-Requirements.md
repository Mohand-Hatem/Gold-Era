# 20 — Security Requirements

Security review with threats, controls, and priority. Highest-priority controls flagged. Decisions in `30`.

## 1. Authentication & credentials

| Threat | Control | Priority |
|---|---|---|
| Password theft from DB | bcrypt cost 12; never store/return/log plaintext or hash (ADR-018) | **P0** |
| Credential stuffing / brute force | generic `ERR_INVALID_CREDENTIALS`; rate limit on `/auth/*` (P1) | P0/P1 |
| Token theft via XSS | httpOnly cookie — JS cannot read token (ADR-008) | **P0** |
| Token forgery | HS256 signed with strong `JWT_SECRET`; verify on every request | **P0** |
| Stale privileges after role change/delete | `tokenVersion` check invalidates old tokens (AUTH-013) | P1 |
| Long-lived token risk | 7-day expiry; logout clears cookie | P0 |

## 2. Cookie & transport

| Threat | Control | Priority |
|---|---|---|
| MITM interception | `Secure` cookie + HTTPS in prod | **P0** |
| CSRF (SameSite=None) | custom header `X-Requested-With` requirement + strict CORS allow-list (ADR-021); double-submit token deferred | P1 |
| Cross-origin abuse | credentialed CORS with explicit origin allow-list (no `*`) | **P0** |
| Cookie scope leakage | `Path=/`, host-only; no `Domain` wildcard | P0 |

Local dev uses `SameSite=Lax` + non-Secure via env flag; prod uses `None; Secure` (`24`/`25`).

## 3. OTP security

| Threat | Control | Priority |
|---|---|---|
| OTP brute force | max 5 attempts/code; 6-digit; short 10-min TTL (ADR-010) | **P0** |
| OTP DB leak | codes stored bcrypt-hashed | **P0** |
| Resend flooding | 60s cooldown + 5/hour cap | P0 |
| OTP reuse | consumed codes invalidated; only latest active valid | P0 |

## 4. Authorization

| Threat | Control | Priority |
|---|---|---|
| Privilege escalation | `authorizeRole('ADMIN')` server-side on all admin routes | **P0** |
| IDOR (access others' files) | ownership check `ownerId === user.id` (admin bypass) (`08`) | **P0** |
| FE-only guard bypass | backend is authoritative; FE guards are UX only (CON-05) | **P0** |
| Admin self-lockout / takeover | block self delete/demote (ADR-020) | P0 |

## 5. File upload security (`13`)

| Threat | Control | Priority |
|---|---|---|
| MIME spoofing (malicious disguised as image) | extension + declared MIME + magic-byte sniff must agree | **P0** |
| Path traversal via filename | UUID storage name; client filename never used for path (ADR-016) | **P0** |
| Oversized/DoS uploads | 10MB/file, 5 files, 50MB/request (Multer limits) | **P0** |
| Executable/script upload | allow-list excludes executables | **P0** |
| Public blob exposure | uploads served only via authorized routes, not static dir | **P0** |
| Zip bombs / complex parsers | extraction sandboxed by try/catch + 20k cap; no recursive archive parsing | P1 |
| Stored XSS via extracted text/filename | render extracted content/filenames as text (React escapes); never `dangerouslySetInnerHTML` | **P0** |

## 6. Input validation & injection

| Threat | Control | Priority |
|---|---|---|
| SQL injection | Prisma parameterised queries; no raw SQL with user input | **P0** |
| NoSQL/query param injection | Zod validation + sort-field whitelist | **P0** |
| Mass assignment | explicit DTOs; only whitelisted fields updated (e.g. only `role`) | P0 |
| Oversized payloads | body size limit; pagination `limit` capped 100 | P0 |

## 7. Secrets & configuration

| Threat | Control | Priority |
|---|---|---|
| Secret leakage in repo | `.env` gitignored; `.env.example` only; no secrets in code | **P0** |
| Secret exposure to client | only `NEXT_PUBLIC_*` exposed; server secrets stay server-side (`25`) | **P0** |
| Weak JWT secret | strong random `JWT_SECRET` (≥32 bytes) documented | P0 |
| Env misconfig at boot | `env.ts` validates required vars, fails fast | P1 |

## 8. Information leakage

| Threat | Control | Priority |
|---|---|---|
| Stack/SQL in responses | generic 500 message; stack only in logs | **P0** |
| User enumeration | generic auth errors; (resend/register enumeration is a documented MVP trade-off — see `11`) | P1 |
| Resource existence disclosure | 403 vs 404 policy documented (`08`) | P2 |

## 9. Rate limiting & abuse (SYS-004)

- `express-rate-limit` on `/auth/login`, `/auth/register`, `/auth/resend-code`, `/files/upload`. Priority **P1**.

## 10. CORS (ADR-008)

- `origin`: explicit allow-list from env (frontend URL[s]).
- `credentials: true`; allow `X-Requested-With`, `Content-Type`; expose none sensitive. No wildcard with credentials. **P0**.

## 11. Highest-priority controls (do these first)

1. bcrypt password hashing; no secret in repo.
2. httpOnly Secure cookie JWT + verify on every protected route.
3. Server-side RBAC + file ownership checks.
4. File validation: ext + MIME + magic bytes + size; UUID storage.
5. Prisma parameterised queries; Zod validation + sort whitelist.
6. Credentialed CORS allow-list; generic error messages; no stack leakage.

## 12. Priority summary

| Priority | Controls |
|---|---|
| P0 | bcrypt, cookie/JWT, HTTPS/Secure, CORS allow-list, RBAC, ownership, file validation, path-traversal defence, Prisma/no-injection, secret hygiene, no stack leak, XSS-safe rendering, OTP hashing+attempts |
| P1 | rate limiting, CSRF custom-header, tokenVersion invalidation, env fail-fast, enumeration hardening, zip-bomb guard |
| P2 | 404-over-403 masking, audit logs |
