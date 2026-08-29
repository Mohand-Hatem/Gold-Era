# 25 — Environment Variables

Every variable, its purpose, example, sensitivity, and usage. Server secrets are **never** exposed to the browser; only `NEXT_PUBLIC_*` reaches the client.

## 1. Frontend (`client/.env.local`)

| Variable | Purpose | Example | Sensitive | Used in |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend origin; Axios appends `/api` | `http://localhost:8080` (dev) / `https://api.example.com` (prod) | No (public) | `lib/axios.ts` baseURL |

Notes: no trailing `/api` (client appends it, ADR-027). Only `NEXT_PUBLIC_*` vars are bundled to the browser.

`client/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 2. Backend (`server/.env`)

| Variable | Purpose | Example | Sensitive | Used in |
|---|---|---|---|---|
| `PORT` | API listen port | `8080` | No | `server.ts` |
| `NODE_ENV` | environment mode | `development` / `production` | No | config, cookie flags |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db?schema=public` | **Yes** | Prisma |
| `JWT_SECRET` | JWT signing secret (≥32 bytes) | `openssl rand -hex 32` output | **Yes** | `TokenService` |
| `JWT_EXPIRES_IN` | token lifetime | `7d` | No | `TokenService` |
| `ADMIN_EMAIL` | seed admin email | `admin@example.com` | Low | `prisma/seed.ts` |
| `ADMIN_NAME` | seed admin name | `Admin` | No | seed |
| `ADMIN_PASSWORD` | seed admin password | `Admin123` | **Yes** | seed |
| `GMAIL_USER` | SMTP sender address | `you@gmail.com` | Low | `MailService` |
| `GMAIL_PASS` | Gmail **app password** | 16-char app password | **Yes** | `MailService` |
| `FRONTEND_URL` | CORS origin allow-list + cookie context | `http://localhost:3000` / `https://app.vercel.app` | No | `config/cors.ts` |
| `COOKIE_SECURE` | force Secure cookie | `false` (dev) / `true` (prod) | No | cookie options |
| `COOKIE_SAMESITE` | cookie SameSite | `lax` (dev) / `none` (prod) | No | cookie options |
| `MAX_FILE_SIZE_MB` | per-file size cap (ADR-002) | `10` | No | upload/multer |
| `MAX_FILES_PER_UPLOAD` | batch cap | `5` | No | upload |
| `UPLOAD_DIR` | storage directory | `uploads` | No | `StorageService` |
| `OTP_TTL_MINUTES` | OTP expiry (ADR-010) | `10` | No | `OtpService` |
| `RATE_LIMIT_WINDOW_MS` | rate-limit window (P1) | `900000` | No | rateLimit |
| `RATE_LIMIT_MAX` | max requests/window (P1) | `100` | No | rateLimit |

The task-provided variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_*`, `GMAIL_*`) are all included; the rest are documented additions from `30` (defaults exist so they are optional).

`server/.env.example`:

```env
PORT=8080
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/managing_files?schema=public"

JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin
ADMIN_PASSWORD=Admin123

GMAIL_USER=
GMAIL_PASS=

FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

MAX_FILE_SIZE_MB=10
MAX_FILES_PER_UPLOAD=5
UPLOAD_DIR=uploads
OTP_TTL_MINUTES=10
```

## 3. Validation at boot

`config/env.ts` validates required vars with Zod and fails fast if a critical one (`DATABASE_URL`, `JWT_SECRET`) is missing (NFR-011). Optional vars fall back to documented defaults.

## 4. Secret hygiene (NFR-003a, `20`)

- `.env` / `.env.local` are **git-ignored**; only `*.example` committed.
- Secrets set via platform dashboards in production (Vercel/Render), never in code or repo.
- `JWT_SECRET` and `ADMIN_PASSWORD` must be changed from examples in production.
- Gmail requires an **App Password** (2FA enabled), not the account password.

## 5. Dev vs prod cookie matrix

| | Dev | Prod |
|---|---|---|
| `COOKIE_SECURE` | false | true |
| `COOKIE_SAMESITE` | lax | none |
| Transport | http | https (required for `none`+`Secure`) |
