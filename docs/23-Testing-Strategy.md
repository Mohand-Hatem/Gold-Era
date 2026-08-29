# 23 — Testing Strategy

Pragmatic testing for an 8–10 hour budget. Prioritise backend correctness of security-critical flows; frontend tests are lighter. Test priority: **T0** must-have · **T1** important · **T2** if time.

## 1. Tooling

| Layer | Tool |
|---|---|
| Backend unit/integration/API | **Vitest + Supertest** |
| Test DB | dedicated PostgreSQL schema/db or transactional cleanup; `.env.test` |
| Frontend component (P2) | Vitest + React Testing Library |
| E2E (optional, P2) | Playwright — 1–2 critical flows only |

## 2. Priorities

| Area | Why | Priority |
|---|---|---|
| Authentication | core gate | T0 |
| Authorization (RBAC) | security boundary | T0 |
| File ownership | IDOR prevention | T0 |
| Upload validation | security + correctness | T0 |
| Admin access control | privilege | T0 |
| Pagination/search/filter/sort | correctness | T1 |
| Statistics calculations | correctness | T1 |
| Extraction | non-blocking behaviour | T1 |
| Frontend components | UX | T2 |
| E2E | confidence | T2 |

## 3. Backend test plan (Supertest against `app`)

### Auth (T0)

- register → 201; duplicate email → 409; weak password → 400.
- verify-email happy → 200; wrong code → 400 `ERR_OTP_INVALID`; expired → `ERR_OTP_EXPIRED`; >5 attempts → 429.
- resend cooldown → 429; resend after cooldown → 200.
- login unverified → 403; bad creds → 401; verified → 200 + Set-Cookie.
- profile with cookie → 200; without → 401.
- logout clears cookie.

### Authorization / RBAC (T0)

- user hitting `/users` → 403.
- admin hitting `/users` → 200.
- protected route without token → 401; expired token → 401.

### File ownership (T0)

- user A cannot GET/DELETE user B's file → 403.
- admin can GET/DELETE any file → 200.

### Upload (T0)

- single valid → 201, row persisted.
- multiple valid (≤5) → 201.
- disallowed type / spoofed MIME → rejected (415 or `failed[]`).
- oversize → 413.
- no files → 400.
- partial batch → `uploaded[]` + `failed[]`.

### Files query (T1)

- pagination meta correct; out-of-range page → empty.
- search matches originalName; empty search → all own.
- filter by category; sort by size/date; invalid sortBy → default.

### Statistics (T1)

- user stats totals/storage/distribution reflect seeded data.
- admin stats totals; non-admin → 403.

### Admin users (T0/T1)

- change role → 200 + persisted; self-demote → 403; self-delete → 403.
- delete user cascades files (files gone) → verify.

### Extraction (T1)

- txt extracted (status DONE, content present).
- corrupt pdf → upload still 201, status FAILED.

## 4. Test data & isolation

- Seed helper creates a verified user, a second user, and an admin; issues cookies via login helper.
- Reset DB between suites (truncate or per-test transaction). Uploads written to a temp dir cleaned in `afterAll`.
- OTP tests: expose the generated code in test env via a hook/spy on `OtpService` (never in prod).

## 5. Frontend tests (T2)

- Dropzone: accepts valid, rejects invalid type/size (unit).
- Auth forms: validation messages render.
- File list: empty state + rows render from mocked query.
- Guard: non-admin redirected from `/admin` (mock auth).

## 6. E2E (T2, optional)

1. Register → (read OTP from test mailbox/console) → verify → login → upload → see file → delete.
2. Admin login → change a user role → delete a file.

## 7. Coverage targets

| Scope | Target |
|---|---|
| Backend auth + files + users services/routes | ~70% lines; 100% of T0 scenarios |
| Overall backend | ≥50% |
| Frontend | best-effort (P2) |

Coverage is a guide, not a gate; **all T0 scenarios must pass** before submission (`33`).

## 8. Commands (target)

```
# backend
npm test            # vitest run
npm run test:watch
npm run test:cov

# frontend (if present)
npm test
```

## 9. Minimum bar for submission

T0 suites green: auth, RBAC, ownership, upload validation, admin self-protection. Roughly 15–20 focused API tests deliver the highest confidence per minute within budget.
