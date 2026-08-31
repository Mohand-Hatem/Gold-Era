# Filox — Modern Cloud Document & Secure File Management System

A production-ready full-stack document and file management platform built with **Next.js 16 (App Router)**, **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Cloudinary**.

Designed with **modular monolith architecture**, end-to-end type safety, automated text extraction, and strict role-based access governance.

---

## 🌐 Live Deployments

- **Frontend Application (Vercel):** [https://gold-era-front.vercel.app](https://gold-era-front.vercel.app)
- **Backend REST API (Vercel Functions):** [https://gold-era-backend.vercel.app](https://gold-era-backend.vercel.app) — migrated off Railway (ADR-043) because Railway's outbound SMTP is Pro-plan-and-above only, which blocked Gmail SMTP delivery.
- **API Health Probe:** [https://gold-era-backend.vercel.app/health](https://gold-era-backend.vercel.app/health)

---

## 🎯 Demo & Test Credentials (Seed Data)

To allow testers, evaluators, and recruiters to test both **Admin** and **Standard User** experiences immediately without creating an account:

| Role | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin@example.com` | `Admin123` | • Full system analytics & 30-day activity trends <br/> • User account governance & role promotions <br/> • Cascade user deletion & global file metrics <br/> • Personal storage vault & text extraction |
| 👤 **Standard User** | *(Register instant account)* <br/> *Or create in Admin panel* | *User password* | • Personal isolated file vault (500 MB quota) <br/> • Multi-file drag & drop uploads (PDF, DOCX, CSV, images) <br/> • Automatic text extraction & deep keyword search <br/> • Custom profile image upload |

---

## 1. Project Overview

Filox is an enterprise-grade SaaS file vault designed to store, manage, inspect, and extract textual content from various document formats securely:
- **Intelligent Processing:** Server-side asynchronous text extraction from PDF (`pdf-parse`), Word (`mammoth`), and plaintext files.
- **Deep Search:** Full-text search across filenames and inside the extracted file contents with a 300ms debounce.
- **Dual View Modes:** Instant toggle between a tabular data grid and a card grid.
- **Secure Authentication:** Email OTP verification (bcrypt-hashed codes, 10-minute expiry, attempt and resend caps), Bcrypt password hashing (cost 12), and signed JWT session cookies with CORS protection.
- **Granular RBAC:** Role-Based Access Control protecting sensitive admin endpoints and personal file vaults.

---

## 2. Technologies Used

### Frontend:
- **Framework:** Next.js 16.3.3 (App Router with Turbopack)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4 & Lucide React Icons
- **State & Data Fetching:** TanStack React Query v5 & Axios
- **Data Visualization:** Recharts (AreaChart, PieChart)

### Backend:
- **Runtime & Framework:** Node.js (v20+ / v22) & Express 5.2 (Modular Monolith)
- **Language:** TypeScript 5.9
- **Database & ORM:** PostgreSQL & Prisma ORM 6.19
- **Authentication & Security:** Bcrypt, JSONWebToken, Express Rate Limit, Cookie-Parser
- **File Processing & Storage:** Multer, File-Type (Magic Bytes), pdf-parse, mammoth, Cloudinary SDK
- **Email Delivery:** Nodemailer over Gmail SMTP (single delivery path, no fallback)
- **Testing:** Vitest 4.1 & Supertest

---

## 3. Folder Structure

```text
Gold-Era/
├── client/                     # Next.js 16 App Router Frontend (Deployed on Vercel)
│   ├── app/
│   │   ├── (public)/           # Landing page, Login, Register, Verify-Email
│   │   ├── (protected)/        # Dashboard, Files Explorer, File Details, Profile, Admin
│   │   ├── globals.css         # Tailwind v4 custom theme tokens, dark mode variants & scrollbars
│   │   └── layout.tsx          # Root HTML layout with query & auth providers
│   ├── components/
│   │   ├── home/               # Modular landing page hero, features, CTA, and testimonials
│   │   ├── layout/             # Navbar, AppHeader, AppSidebar, Footer
│   │   ├── files/              # FileUploadModal, DeleteFileModal
│   │   └── ui/                 # Accessible UI components (Button, Modal, Card, Badge, ThemeToggle)
│   ├── providers/              # AuthProvider, ToastProvider, QueryProvider, ThemeProvider
│   ├── types/                  # Shared frontend API TypeScript interfaces
│   └── lib/                    # Axios client instance and utility formatters
│
├── server/                     # Express 5 REST API (Deployed on Vercel Functions, ADR-043)
│   ├── api/
│   │   └── index.ts            # Vercel serverless entry point — imports the compiled Express app
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma database models (User, VerificationCode, File)
│   │   ├── migrations/         # PostgreSQL migration history
│   │   └── seed.ts             # Idempotent admin bootstrap seed script
│   ├── src/
│   │   ├── config/             # Zod environment validation, Prisma, CORS, Cloudinary
│   │   ├── middleware/         # Authenticate, RBAC, RateLimit, ErrorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # Login, Register, OTP verification, Profile, Avatar upload
│   │   │   ├── files/          # Signed upload, Confirm, List/Search, Details, Download redirect, Delete
│   │   │   ├── users/          # Admin user management & role changes
│   │   │   └── stats/          # User storage & platform-wide analytics
│   │   ├── services/           # Token, Password, Mail, Storage (Cloudinary), Text Extraction
│   │   └── utils/              # AppError, standard API response envelopes, AsyncHandler
│   ├── tests/                  # Automated Vitest + Supertest test suites
│   └── vercel.json              # Vercel build command, function config, and rewrites
└── README.md                   # Project documentation
```

---

## 4. Setup Instructions & Running Locally

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **PostgreSQL**: Local PostgreSQL instance or a free cloud database (e.g. [Neon](https://neon.tech))
- **Cloudinary Account**: Free Cloudinary cloud name and API keys

### Step 1: Clone the Repository
```bash
git clone https://github.com/Mohand-Hatem/Gold-Era.git
cd Gold-Era
```

### Step 2: Backend Setup & Launch
```bash
cd server
npm install

# Copy environment variables template
cp .env.example .env

# Configure DATABASE_URL, JWT_SECRET, Cloudinary keys, and the SMTP_* block in
# server/.env. Registration cannot complete without working SMTP credentials —
# there is no console fallback (see §5.1).

# Run database migration and seed admin
npx prisma db push
npm run db:seed

# Start backend development server (Runs on http://localhost:8080)
npm run dev
```

### Step 3: Frontend Setup & Launch
```bash
# In a separate terminal window
cd client
npm install

# Copy environment variables template
cp .env.example .env.local

# Start Next.js development server (Runs on http://localhost:3000)
npm run dev
```

Visit **`http://localhost:3000`** to access the application.

---

## 5. Environment Variables

### Frontend Variables (`client/.env.local`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:8080` (Local) / `https://gold-era-backend.vercel.app` (Prod) |

### Backend Variables (`server/.env`)
| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Port on which Express listens locally | `8080` (unset in production — Vercel injects and manages this itself; don't set it there) |
| `NODE_ENV` | No in prod | Environment mode | `development` / `production` (Vercel sets `production` itself — don't set it there either) |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Yes | 32+ character key for signing JWTs | `a-very-long-and-secure-random-secret-key-32` |
| `JWT_EXPIRES_IN` | No | JWT expiration duration | `7d` |
| `CLOUDINARY_CLOUD_NAME`| Yes | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Yes | Cloudinary API Secret | `your_api_secret` |
| `CLOUDINARY_FOLDER` | No | Prefix folder in Cloudinary | `filox` |
| `FRONTEND_URL` | Yes | Origin URL of the frontend (for CORS & cookies) | `http://localhost:3000` (Local) / `https://gold-era-front.vercel.app` (Prod) |
| `COOKIE_SECURE` | No | Send the session cookie over HTTPS only | `false` (Local) / `true` (Prod) |
| `COOKIE_SAMESITE` | No | Session cookie `SameSite` policy | `lax` (Local) / `none` (Prod, cross-site) |
| `OTP_TTL_MINUTES` | No | Verification code lifetime | `10` (default) |
| `ADMIN_EMAIL` | No | Pre-seeded admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | No | Pre-seeded admin password | `Admin123` |
| `SMTP_HOST` | No | Gmail SMTP host | `smtp.gmail.com` (default) |
| `SMTP_PORT` | No | SMTP port (implicit TLS) | `465` (default) |
| `SMTP_SECURE` | No | Implicit TLS on connect | `true` (default) |
| `SMTP_USER` | **In prod** | Gmail address used to send OTP email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | **In prod** | Gmail 16-character **App Password** (never the account password) | `xxxxxxxxxxxxxxxx` |
| `SMTP_FROM` | No | Envelope From | `"Filox" <your-email@gmail.com>` (default) |

`SMTP_USER` and `SMTP_PASSWORD` are optional in development and **required when `NODE_ENV=production`** — the server refuses to boot without them rather than starting in a state where no account can ever be activated.

### 5.1 Email / OTP Delivery

Verification codes travel one path and one path only:

```text
Registration → OTP generated (crypto.randomInt) → hashed with bcrypt and stored
            → Nodemailer → Gmail SMTP (smtp.gmail.com:465, implicit TLS) → user's inbox
```

**There is no fallback.** If SMTP delivery fails, the API returns `503 ERR_EMAIL_SEND_FAILED` with the message *"Unable to send verification email. Please try again."* The code is never printed to the console, never returned in a response, and never included in an error message. The account row still exists, so the user can request a replacement code once the 60-second resend cooldown elapses.

**Gmail setup:** enable 2-Step Verification on the sending account, then create an [App Password](https://myaccount.google.com/apppasswords) and use those 16 characters as `SMTP_PASSWORD`. The normal account password will not authenticate.

Production logs contain only:

```text
[mail] Sending verification email to user@example.com
[mail] Verification email sent successfully to user@example.com
[mail] Failed to send verification email to user@example.com: Connection timeout
```

**OTP policy:** 6 digits from `crypto.randomInt`, bcrypt-hashed at rest, 10-minute expiry, consumed on successful verification, 5 verification attempts per code, 60-second resend cooldown, and 5 resends per rolling hour. Requesting a new code invalidates all previous ones.

---

## 6. Database Migration & Seeding Steps

Prisma is used for schema management, migrations, and database seeding.

### Apply Schema to Database:
```bash
cd server

# In development (create and apply migration history):
npx prisma migrate dev --name init

# Against production (run manually before the first deploy and after any
# schema change — Vercel has no start command to chain this into, unlike a
# long-running host):
npx prisma migrate deploy
# or, equivalently for this project's workflow:
npx prisma db push
```

### Seed the Default Admin Account:
```bash
cd server
npm run db:seed
```
*Output: `[seed] admin ready: admin@example.com (ADMIN, verified=true)`*

### Inspect Database with Prisma Studio:
```bash
cd server
npx prisma studio
```
Opens interactive GUI at `http://localhost:5555` to view and manage tables.

---

## 7. Deployment Instructions

### A. Backend Deployment (Vercel Functions — ADR-043)

> **Why not Railway.** Railway's outbound SMTP is available on the **Pro plan and above only** — Free, Trial, and Hobby have it disabled. Nodemailer + Gmail SMTP could not connect from any lower tier (it surfaced as `ETIMEDOUT` / `command: 'CONN'`, a dropped TCP handshake before TLS or auth — no Nodemailer setting works around it). Vercel Functions permit outbound SMTP on ports 465/587, at the cost of a 4.5 MB request/response body cap — see the upload/download note below.

1. Run migrations against production **before the first deploy** (§6) — there is no start command on Vercel to chain them into automatically.
2. Import the repository into [Vercel](https://vercel.com) as a **separate project** from the frontend. Set the **Root Directory** to `server`, Framework Preset to **Other**, Build Command to `npm run build`.
3. Add the required Environment Variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_*`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `CLOUDINARY_*`, `FRONTEND_URL`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`, `MAX_FILE_SIZE_MB`, `MAX_FILES_PER_UPLOAD`, `OTP_TTL_MINUTES`, `RATE_LIMIT_*`. Leave `PORT` and `NODE_ENV` unset — Vercel sets both itself.
4. `COOKIE_SECURE=true` / `COOKIE_SAMESITE=none` are required regardless of which host runs the API: the frontend (`vercel.app`) and this backend project are different sites, so the session cookie is cross-site; browsers drop `SameSite=Lax` cookies there and only accept `SameSite=None` alongside `Secure`.
5. Deploy. Vercel picks up [`server/vercel.json`](server/vercel.json), which sets the build command and routes every path to the single function at `server/api/index.ts`.
6. Confirm with a **real** registration that verification email arrives — there is no console fallback to fall back on if it doesn't.

> **Uploads and downloads bypass this API's body limits.** A Vercel Function caps both request and response bodies at 4.5 MB, under the 10 MB per-file limit above. Files upload directly from the browser to Cloudinary using a server-issued signature (`POST /files/upload-signature` → direct upload → `POST /files/confirm`), and downloads redirect (`302`) to the Cloudinary delivery URL rather than streaming through the function. See [docs/24 §6](docs/24-Deployment-Architecture.md) and [ADR-043/044](docs/30-Assumptions-and-Decisions.md).

### B. Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com) as its own project.
2. Set the **Root Directory** to `client` and Framework Preset to `Next.js`.
3. Add the Environment Variable, pointing at the backend project from step A:
   ```env
   NEXT_PUBLIC_API_URL=https://gold-era-backend.vercel.app
   ```
4. Click **Deploy**.

---

## 8. Assumptions & Architectural Decisions

1. **Storage Quotas & Limits:**
   * Maximum file size: **10 MB per file**.
   * Maximum batch upload: **5 files per batch**.
   * User storage limit: **500 MB per user vault**.
2. **Text Extraction Pipeline:**
   * Text extraction runs synchronously during file processing for PDF, DOCX, CSV, JSON, and TXT files, storing extracted text in PostgreSQL for full-text search.
   * Extraction failures do not block file storage; files are still saved even if text parsing encounters complex formatting.
3. **Security & Session Tokens:**
   * Authentication tokens are transmitted in `httpOnly`, `SameSite=None`, `Secure` cookies to protect against Cross-Site Scripting (XSS) and token theft.
   * Modifying user roles or deleting accounts immediately invalidates active sessions via `tokenVersion` checks.
4. **Cloud Storage Persistence:**
   * Files are stored in **Cloudinary** rather than local disk storage to guarantee persistence across serverless and container restarts.
   * Uploads go directly from the browser to Cloudinary using a server-issued signature, and downloads redirect to Cloudinary's delivery URL rather than passing through the API (ADR-043/044) — required once the API moved to Vercel Functions, which cap request/response bodies at 4.5 MB. Assets are public-but-unguessable (`type: "upload"`), so access control is enforced by never handing out a URL to anyone but the file's owner (or an admin), not by Cloudinary-side authentication.
   * Non-image files (PDF, DOCX, CSV, JSON, TXT, MD) are stored as Cloudinary's `raw` resource type, which is addressed by its full path **including the file extension** once uploaded with an explicit format — delivery URLs must include that extension or the asset 404s even though it exists.
   * **Assumption / known account requirement:** Cloudinary's default "Restricted media types" security setting blocks public delivery of PDF and ZIP specifically (confirmed: `.docx`/`.csv`/`.json`/`.md`/`.txt` all deliver `200`, `.pdf`/`.zip` return `401` until this is changed). A Cloudinary account used for this app must have PDF/ZIP delivery explicitly enabled under **Console → Settings → Security → Restricted media types** — otherwise every PDF upload succeeds but every PDF download/preview fails.
5. **Debounced Search:**
   * The client debounces search input by **300ms** to prevent unnecessary database queries while the user is typing.
6. **Email Delivery Has No Fallback:**
   * Nodemailer over Gmail SMTP is the only delivery mechanism; no secondary provider is configured.
   * A verification code is a live credential, so it is never written to logs or returned by the API. A delivery failure is reported as `503 ERR_EMAIL_SEND_FAILED` rather than being masked by a success response.
   * Registration awaits delivery instead of dispatching it in the background, trading roughly a second of latency for the ability to tell the user their code was actually sent.
7. **Hosting Moved to Vercel Functions (ADR-043):**
   * Railway's outbound SMTP is Pro-plan-and-above only, which made item 6 impossible to satisfy from Railway's free/trial/hobby tiers. Vercel Functions permit outbound SMTP without adding an email provider.
   * The trade-off is a 4.5 MB request/response body cap, addressed by moving uploads and downloads off the API entirely (item 4) rather than shrinking the documented 10 MB limit.
   * `express-rate-limit`'s in-memory store is per-instance; across serverless instances the auth rate limiter is weaker than on a single long-running dyno. The OTP-specific caps (verification attempts, resend cooldown, hourly resend limit) are database-backed and unaffected.

---

## 9. Automated Testing

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest**:

```bash
cd server
npm test
```

```text
 ✓ tests/health.test.ts             (2 tests)
 ✓ tests/files.test.ts              (8 tests)
 ✓ tests/files-upload.test.ts       (10 tests)
 ✓ tests/auth.test.ts               (7 tests)
 ✓ tests/users.test.ts              (6 tests)
 ✓ tests/mail.test.ts               (11 tests)
 ✓ tests/mail-unconfigured.test.ts  (2 tests)
 ✓ tests/auth-verification.test.ts  (4 tests)

 Test Files  8 passed (8)
      Tests  50 passed (50)
```

Nodemailer, Cloudinary/storage, and the repositories are mocked at the module boundary, so the suite opens no sockets, touches no database, and sends no real email. The mail tests assert the transport configuration (port 465, implicit TLS, a resolved IPv4 literal, certificate validation left on), that the code reaches the SMTP payload, and — on both success and SMTP failure — that the code appears in **no** log line, no error message, and no fallback channel. `files-upload.test.ts` covers the direct-to-Cloudinary flow: signatures are only issued for allowlisted files, a confirmed upload is re-validated against its real fetched bytes rather than the client's claims, a failure at any step removes the orphaned blob, and downloads resolve a Cloudinary URL only after the ownership check passes.

---

## 👨‍💻 Author

**Mohand Hatem** — Full Stack Web Developer  
- **GitHub:** [@Mohand-Hatem](https://github.com/Mohand-Hatem)
