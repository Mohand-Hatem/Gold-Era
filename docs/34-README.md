# 34 — README Specification

Blueprint for the **root `README.md`** deliverable. The root README already exists and is largely complete; this document defines the required sections and the placeholders to fill after deployment (Phase 14 / DOC-001). Do not invent live URLs — use placeholders until deployed.

## Required sections & content

### 1. Title & one-line description
"Managing Your Files — a full-stack file management system (Next.js + Express + Prisma + PostgreSQL)."

### 2. Live demo
- Frontend URL: `YOUR_FRONTEND_URL` (Vercel)
- Backend URL: `YOUR_BACKEND_URL` (Render/Railway/Fly)
- Admin login (from env): `ADMIN_EMAIL` / `ADMIN_PASSWORD` (note: change in prod).

### 3. Project overview
2–3 paragraphs: purpose, user vs admin capabilities, that auth uses OTP + JWT-cookie. Link to `docs/`.

### 4. Features
Bulleted P0 feature list (auth+OTP+RBAC, upload/multi/drag-drop/progress/validation, list search/filter/sort/paginate, details+extracted content, delete, user+admin dashboards, admin user/file management). Note P1/P2 (download/preview; dark mode etc.) as implemented/optional.

### 5. Technology stack
Frontend (Next.js App Router, TS, Tailwind, Framer Motion, TanStack Query, Axios, Recharts) and Backend (Express, TS, Prisma, PostgreSQL, JWT, Multer, bcrypt, Nodemailer, Zod, Vitest).

### 6. Architecture
Short description + the `client/`+`server/`+`docs/` tree (from `16`). Link to `docs/15` and `docs/14`.

### 7. Project / repository structure
Directory tree with one-line responsibilities (condensed from `16`).

### 8. Prerequisites
Node 20+, npm, PostgreSQL, Git.

### 9. Environment variables
Reproduce the `.env.example` blocks for client and server (from `25`), with a one-line purpose each and a "never commit secrets" note.

### 10. Setup — running locally
Step-by-step:
1. Clone.
2. `server`: `npm install`, create `.env`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev` (→ :8080).
3. `client`: `npm install`, create `.env.local`, `npm run dev` (→ :3000).

### 11. Database & migrations
`prisma migrate dev` (local), `prisma migrate deploy` (prod), `prisma db seed` (admin), `prisma studio`. Note the seeded admin.

### 12. API overview
Table of endpoints + auth level (condensed from `11` §7). Note base path `/api` and the response envelope.

### 13. Authentication
Explain OTP verification + JWT httpOnly cookie + RBAC; note cross-origin cookie requirement (`SameSite=None; Secure` in prod).

### 14. Testing
How to run backend tests (`npm test`) and what is covered (T0 flows).

### 15. Deployment
Frontend (Vercel) + backend (Render/Railway/Fly) + managed PostgreSQL. Include the release commands (`migrate deploy` + `seed`) and required prod env (cookie flags, CORS origin). Link `docs/24`.

### 16. Assumptions
Short list linking to `docs/30`: file limits, allowed types, extraction scope, OTP policy, token lifetime, hard delete + cascade, Cloudinary blob storage, `/api` prefix, Recharts, cookie auth.

### 17. Trade-offs & limitations
- Blobs are stored in Cloudinary (`type: authenticated`), so raw provider URLs are never exposed and all reads go through an authorized endpoint. Requires a Cloudinary account.
- No image OCR (P3).
- Client-side data fetching (auth cookie) rather than server components for user data.
- Refresh tokens not implemented (7-day access token).

### 18. Bonus features implemented
List any P1/P2 actually built (download/preview, dark mode, etc.).

### 19. Screenshots
Placeholder section for UI screenshots (login, files, details, dashboard, admin).

### 20. Author & license
Author: Mohand Hatem. License: assessment project.

## Placeholders to replace after deploy

| Placeholder | Replace with |
|---|---|
| `YOUR_FRONTEND_URL` | Vercel URL |
| `YOUR_BACKEND_URL` | backend URL |
| `YOUR_GITHUB_REPOSITORY_URL` | repo URL |
| screenshots | actual images |

## Consistency checks (vs docs)

- Endpoints match `11`; env vars match `25`; structure matches `16`; assumptions link to `30`; stack matches `02`. Update the existing root README's stack section to add **Recharts, Zod, Nodemailer, bcrypt, Vitest** and confirm PostgreSQL.
