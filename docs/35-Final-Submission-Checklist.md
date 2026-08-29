# 35 — Final Submission Checklist

Mark each: `[ ]` Not started · `[~]` In progress · `[x]` Done. Do not submit until all **P0** items are `[x]`.

## P0 requirements coverage

- [ ] All P0 requirements in `02` implemented and verified against `28`.

## Frontend

- [ ] Next.js App Router structure per `14`/`16`.
- [ ] Responsive on mobile/tablet/desktop.
- [ ] Tailwind styling consistent; reusable components.
- [ ] Framer Motion animations present.
- [ ] Loading/empty/error states everywhere.
- [ ] Toast notifications on mutations.
- [ ] React Query caching + invalidation (`17`).
- [ ] Recharts dashboards (user + admin).
- [ ] `next build` passes, no type errors.

## Backend

- [ ] All endpoints (`11`) with standard envelope.
- [ ] Layered modular monolith (`15`).
- [ ] Central error handling + notFound (`19`).
- [ ] Zod validation on all inputs (`18`).
- [ ] `npm run build` passes, no type errors.

## Authentication

- [ ] Register works.
- [ ] OTP email verification works.
- [ ] Resend code works (cooldown + limit).
- [ ] Login issues httpOnly cookie JWT.
- [ ] Logout clears cookie.
- [ ] Profile endpoint/page works.
- [ ] Password hashing (bcrypt) verified.

## Authorization

- [ ] Protected routes return 401 without token.
- [ ] Admin routes return 403 for users.
- [ ] File ownership enforced (cross-owner 403).
- [ ] Admin self delete/demote blocked.
- [ ] Frontend guards + backend enforcement both present.

## Database

- [ ] Prisma schema matches `09` (models, enums, indexes, cascade).
- [ ] Migrations committed and apply cleanly.
- [ ] Admin seed idempotent and verified.

## Upload

- [ ] Single upload works.
- [ ] Multiple upload works (≤5).
- [ ] Drag & drop works.
- [ ] Progress indicator works.
- [ ] Client + server validation works.
- [ ] Extraction (text/pdf/docx) works; failure non-blocking.
- [ ] UUID storage; no path traversal.

## File management

- [ ] List own files works.
- [ ] Search works.
- [ ] Filter works.
- [ ] Sort works.
- [ ] Pagination works.
- [ ] File details + extracted content works.
- [ ] Delete file (row + blob) works.
- [ ] Download/preview (P1) works if implemented.

## Statistics

- [ ] User stats endpoint + dashboard correct.
- [ ] Admin stats endpoint + dashboard correct.
- [ ] Upload history buckets correctly.

## Admin

- [ ] User list/search/paginate.
- [ ] Change role.
- [ ] Delete user (cascade).
- [ ] All-files list/search/filter/paginate with owner.
- [ ] Delete any file.
- [ ] Recent uploads.
- [ ] Confirmation dialogs on destructive actions.

## Security

- [ ] No secrets committed; `.env` ignored; `.env.example` present.
- [ ] CORS restricted to frontend origin with credentials.
- [ ] Cookie `Secure; SameSite=None` in prod.
- [ ] File validation (ext+MIME+magic bytes+size).
- [ ] No stack/SQL leakage; XSS-safe rendering.
- [ ] OTP hashed + attempt/resend limits.

## Tests

- [ ] T0 suites green (auth, RBAC, ownership, upload, admin self-protection).
- [ ] Test commands documented.

## Deployment

- [ ] Backend deployed; `/health` ok.
- [ ] `migrate deploy` + `db seed` run in prod.
- [ ] Frontend deployed (Vercel) with `NEXT_PUBLIC_API_URL`.
- [ ] Cross-origin login + upload verified in production.
- [ ] Cloudinary credentials set; production upload succeeds and survives a redeploy.

## Environment variables

- [ ] All required vars set in both platforms.
- [ ] `JWT_SECRET` and `ADMIN_PASSWORD` changed from examples.
- [ ] Gmail app password valid (or fallback accepted).

## README & docs

- [ ] Root README complete per `34` (overview, stack, structure, setup, env, migrations, run, deploy, assumptions).
- [ ] Live URLs filled in.
- [ ] `docs/` package present.

## GitHub

- [ ] Public repo with client + server + docs.
- [ ] Meaningful commit history.
- [ ] No secrets in history.
- [ ] `.gitignore` covers `.env*`, `uploads/`, `node_modules`, `.next`, `dist`.

## Production URLs

- [ ] Frontend URL working.
- [ ] Backend URL working.
- [ ] Submit repo + frontend URL + backend URL before the 10-day deadline.

## Final quality pass

- [ ] `QUALITY REVIEW` (in `docs` process) completed.
- [ ] Traceability matrix (`31`) shows all mandatory requirements ✅.
- [ ] Definition of Done (`33`) fully satisfied for P0.
