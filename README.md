# Filox — Modern Cloud Document & Secure File Management System

A production-ready full-stack document and file management platform built with **Next.js 16 (App Router)**, **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Cloudinary**.

Designed with **modular monolith architecture**, end-to-end type safety, automated text extraction, and strict role-based access governance.

---

## 🌐 Live Deployments

- **Frontend Application (Vercel):** [https://gold-era-front.vercel.app](https://gold-era-front.vercel.app)
- **Backend REST API (Railway):** [https://gold-era-production.up.railway.app](https://gold-era-production.up.railway.app)
- **API Health Probe:** [https://gold-era-production.up.railway.app/health](https://gold-era-production.up.railway.app/health)

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
- **Secure Authentication:** Email OTP verification, Bcrypt password hashing (cost 12), and signed JWT session cookies with CORS protection.
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
- **Email Delivery:** Nodemailer (Gmail SMTP + local console fallback)
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
├── server/                     # Express 5 REST API (Deployed on Railway)
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma database models (User, VerificationCode, File)
│   │   ├── migrations/         # PostgreSQL migration history
│   │   └── seed.ts             # Idempotent admin bootstrap seed script
│   ├── src/
│   │   ├── config/             # Zod environment validation, Prisma, CORS, Cloudinary
│   │   ├── middleware/         # Authenticate, RBAC, Upload (Multer), RateLimit, ErrorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # Login, Register, OTP verification, Profile, Avatar upload
│   │   │   ├── files/          # Upload, List/Search, Details, Download Stream, Delete
│   │   │   ├── users/          # Admin user management & role changes
│   │   │   └── stats/          # User storage & platform-wide analytics
│   │   ├── services/           # Token, Password, Mail, Storage (Cloudinary), Text Extraction
│   │   └── utils/              # AppError, standard API response envelopes, AsyncHandler
│   ├── tests/                  # Automated Vitest + Supertest test suites
│   ├── railway.json            # Railway deployment blueprint & health check configuration
│   └── nixpacks.toml           # Nixpacks Node.js 22 + OpenSSL build recipe
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

# Configure your DATABASE_URL, JWT_SECRET, and Cloudinary keys in server/.env

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
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:8080` (Local) / `https://gold-era-production.up.railway.app` (Prod) |

### Backend Variables (`server/.env`)
| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | No | Port on which Express listens | `8080` (Railway injects automatically) |
| `NODE_ENV` | Yes | Environment mode | `development` / `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Yes | 32+ character key for signing JWTs | `a-very-long-and-secure-random-secret-key-32` |
| `JWT_EXPIRES_IN` | No | JWT expiration duration | `7d` |
| `CLOUDINARY_CLOUD_NAME`| Yes | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Yes | Cloudinary API Secret | `your_api_secret` |
| `CLOUDINARY_FOLDER` | No | Prefix folder in Cloudinary | `filox` |
| `FRONTEND_URL` | Yes | Origin URL of the frontend (for CORS & cookies) | `http://localhost:3000` (Local) / `https://gold-era-front.vercel.app` (Prod) |
| `ADMIN_EMAIL` | No | Pre-seeded admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | No | Pre-seeded admin password | `Admin123` |
| `SMTP_HOST` | No | Gmail SMTP host | `smtp.gmail.com` (default) |
| `SMTP_PORT` | No | SMTP port (implicit TLS) | `465` (default) |
| `SMTP_SECURE` | No | Implicit TLS on connect | `true` (default) |
| `SMTP_USER` | **In prod** | Gmail address used to send OTP email | `your-email@gmail.com` |
| `SMTP_PASSWORD` | **In prod** | Gmail 16-character **App Password** (never the account password) | `xxxxxxxxxxxxxxxx` |
| `SMTP_FROM` | No | Envelope From | `"Filox" <your-email@gmail.com>` (default) |

---

## 6. Database Migration & Seeding Steps

Prisma is used for schema management, migrations, and database seeding.

### Apply Schema to Database:
```bash
cd server

# In development (create and apply migration history):
npx prisma migrate dev --name init

# In production / Railway (direct push):
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

### A. Backend Deployment (Railway)
1. In your [Railway Dashboard](https://railway.com/), create a new project and add a **PostgreSQL** database.
2. Link your GitHub repository (`Gold-Era`) and set the **Root Directory** to `server`.
3. Add the required Environment Variables (`NODE_ENV=production`, `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET`, `CLOUDINARY_*`, `FRONTEND_URL`).
4. Railway automatically detects [`server/railway.json`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/server/railway.json), runs `npx prisma db push --skip-generate`, verifies `/health`, and starts the server.

### B. Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client` and Framework Preset to `Next.js`.
3. Add the Environment Variable:
   ```env
   NEXT_PUBLIC_API_URL=https://gold-era-production.up.railway.app
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
   * Files are stored as authenticated blobs in **Cloudinary** rather than local disk storage to guarantee persistence across serverless and container restarts.
5. **Debounced Search:**
   * The client debounces search input by **300ms** to prevent unnecessary database queries while the user is typing.

---

## 9. Automated Testing

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest**:

```bash
cd server
npm test
```

```text
 ✓ tests/health.test.ts (2 tests)
 ✓ tests/files.test.ts  (6 tests)
 ✓ tests/auth.test.ts   (7 tests)
 ✓ tests/users.test.ts  (6 tests)

 Test Files  4 passed (4)
      Tests  21 passed (21)
```

---

## 👨‍💻 Author

**Mohand Hatem** — Full Stack Web Developer  
- **GitHub:** [@Mohand-Hatem](https://github.com/Mohand-Hatem)
