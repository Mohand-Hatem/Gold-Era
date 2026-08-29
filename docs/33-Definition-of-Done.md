# 33 — Definition of Done

The assignment is complete only when **all P0 items** below are satisfied. P1/P2 are optional quality boosts.

## Functional (P0)

- [ ] Register → OTP email → verify → login → logout → profile all work.
- [ ] Upload (single, multiple, drag-drop) with progress and validation works.
- [ ] Files stored, metadata persisted, content extracted (text/pdf/docx).
- [ ] My Files: list + search + filter + sort + pagination + details + delete, ownership-scoped.
- [ ] User statistics dashboard renders real data.
- [ ] Admin: user list/search/role/delete, all-files list/search/filter/paginate/delete, admin stats.
- [ ] Admin self delete/demote blocked.

## Backend (P0)

- [ ] All endpoints in `11` implemented with the standard envelope.
- [ ] JWT via httpOnly Secure cookie; `authenticate` + `authorizeRole` + ownership checks enforced.
- [ ] Central error handler + notFound; consistent error codes (`19`).
- [ ] Zod validation on all inputs; sort-field whitelisting.
- [ ] Upload validation: extension + MIME + magic bytes + size; UUID storage; failure cleanup.
- [ ] Statistics aggregations correct per `21`.
- [ ] Builds with TypeScript (no type errors); `npm run build` succeeds.

## Frontend (P0)

- [ ] All routes/guards per `14`; admin pages gated (UX) with backend enforcement.
- [ ] React Query for all API data with correct invalidation (`17`).
- [ ] Loading, empty, and error states on every async view; toasts on mutations.
- [ ] Axios `withCredentials`; 401 interceptor redirects to login.
- [ ] Recharts dashboards render for user and admin.
- [ ] Responsive on mobile/tablet/desktop.
- [ ] Builds (`next build`) with no type errors.

## Database (P0)

- [ ] Prisma schema matches `09`; enums, unique constraints, indexes, cascade present.
- [ ] Migrations committed and apply cleanly (`migrate deploy`).
- [ ] Idempotent admin seed creates a verified ADMIN from env.

## Security (P0)

- [ ] Passwords bcrypt-hashed; never returned/logged.
- [ ] OTP hashed, expiring, attempt- and resend-limited.
- [ ] RBAC + ownership enforced server-side.
- [ ] CORS restricted to frontend origin with credentials.
- [ ] No secrets committed; `.env` ignored; `.env.example` present.
- [ ] No stack/SQL leakage in responses; XSS-safe rendering.

## UX (P0)

- [ ] Clean, consistent Tailwind UI; reusable components/hooks.
- [ ] Framer Motion transitions present and non-blocking.
- [ ] Confirmation dialogs on destructive actions.

## Testing (P0/T0)

- [ ] T0 suites green: auth, RBAC, ownership, upload validation, admin self-protection.
- [ ] Test commands documented (`23`).

## Deployment (P0)

- [ ] Backend deployed; `/health` ok; migrations + seed run.
- [ ] Frontend deployed (Vercel) with `NEXT_PUBLIC_API_URL`.
- [ ] Cross-origin cookie auth verified in production.
- [ ] Ephemeral-storage limitation documented.

## Documentation (P0)

- [ ] Root `README.md` complete per `34` (overview, stack, structure, setup, env, migrations, run, deploy, assumptions, live URLs).
- [ ] `docs/` package present and consistent.

## Submission (P0)

- [ ] Public GitHub repo with client + server + docs, meaningful commit history.
- [ ] Live frontend URL working.
- [ ] Live backend URL working.
- [ ] `35` checklist all P0 items marked Done.

## Quality gates

- [ ] No `console.error` noise in normal flows; errors handled.
- [ ] Lint/format clean (ESLint + Prettier).
- [ ] No unused dead code or committed secrets/keys.
- [ ] TypeScript strict; no `any` in public interfaces where avoidable.
