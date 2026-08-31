# Filox — Cloud Document & File Management System

A production-ready full-stack document and file management platform built with **Next.js 16 (App Router)**, **Express 5**, **TypeScript**, **Prisma ORM**, **Neon PostgreSQL**, and **Cloudinary**.

Developed as a comprehensive Full Stack Developer technical assessment adhering strictly to industry standards, modular monolith architecture, and security best practices.

---

## 🚀 Live Deployments

- **Frontend Application (Vercel):** `https://gold-era-front.vercel.app`
- **Backend REST API (Vercel / Render):** `https://gold-era-production.up.railway.app`
- **Default Seeded Admin Account:**
  - **Email:** `admin@example.com`
  - **Password:** `Admin123` *(Note: Change in production)*

---

## 📌 Features Overview

### 🔐 Authentication & Session Security
- **Registration & Email OTP:** 6-digit numeric verification codes delivered via Gmail SMTP (with automated development terminal fallback).
- **Rate-Limited Resend:** 60-second cooldown timer and 5 resends/hour cap to prevent abuse.
- **Session Tokens:** Signed JWT access tokens transmitted exclusively via `httpOnly`, `Secure`, `SameSite` cookies (resistant to XSS and token theft).
- **Session Invalidation:** Automatic `tokenVersion` increments on role modifications and cascade deletions.
- **Idempotent Logout:** Reliable session cookie clearance without requiring active credentials.

### 📁 Document & File Operations
- **Multi-File Upload Zone:** Interactive drag-and-drop zone supporting up to 5 files per batch (max 10 MB per file).
- **Format Allowlist & Validation:** PDF, DOCX, CSV, JSON, TXT, Markdown, PNG, JPEG, and WebP.
- **Magic-Byte Sniffing:** Verifies true binary signatures to prevent malicious extension spoofing.
- **Automated Text Extraction:** Server-side parsing for PDF (`pdf-parse`), Word (`mammoth`), CSV, and plain text without blocking upload completion.
- **Authenticated Cloud Storage:** Files are stored as authenticated blobs in Cloudinary, ensuring persistence across serverless dyno restarts.
- **Display Sanitization:** Sanitizes filenames against directory traversal (`..\`) and OS-reserved characters while storing unguessable internal UUIDs.

### 🔎 Explorer, Search & Filtering
- **Deep Search:** Live keyword search querying both original filenames and extracted document text.
- **Category Filter Chips:** Instant filtering across `Documents`, `Images`, `Spreadsheets / Code`, and `Archives`.
- **Dynamic Sorting:** Sort by upload date (newest/oldest), file size (largest/smallest), and alphabetical name.
- **Pagination:** Responsive pagination controls with page indicators and boundary protection.
- **Details & Extracted Content Viewer:** Dedicated file inspector featuring formatted metadata, SHA-256 checksums, and a 1-click **Copy Text** button.
- **Downloads & Stream Preview:** Authenticated inline image preview and attachment download streams.

### 📊 Dashboards & Analytics
- **Personal Vault Dashboard:** Real-time file count, storage capacity bar (out of 500 MB quota), and **Recharts** category distribution charts.
- **Admin System Overview:** System-wide metrics, 30-day platform upload activity curves (AreaChart), and global file format donut charts (PieChart).
- **Admin User Governance:** Searchable user directory, role switcher (`USER` ↔ `ADMIN`), self-demotion prevention (`ERR_SELF_DEMOTE`), and cascade user deletion (`ERR_SELF_DELETE`).

---

## 🛠️ Technology Stack

```text
Frontend:
  ├── Framework: Next.js 16.3.3 (App Router with Turbopack)
  ├── Language: TypeScript 5.9
  ├── Styling: Tailwind CSS & Lucide Icons
  ├── Data Fetching: TanStack React Query v5 & Axios
  └── Data Visualization: Recharts

Backend:
  ├── Framework: Express 5.2 (Modular Monolith)
  ├── Language: TypeScript 5.9
  ├── Database ORM: Prisma 6.19 (PostgreSQL / Neon)
  ├── Security: Bcrypt (cost 12), JSONWebToken, Express Rate Limit
  ├── File Ingestion: Multer (Memory Storage) & File-Type (Magic Bytes)
  ├── Text Extraction: pdf-parse, mammoth, csv-parse
  ├── Cloud Storage: Cloudinary (Authenticated Blobs)
  ├── Email: Nodemailer (Gmail SMTP + Dev Console Fallback)
  └── Test Runner: Vitest & Supertest
```

---

## 🏗️ Architecture & Repository Structure

```text
Managing-Your-Files/
├── client/                     # Next.js 16 App Router Frontend
│   ├── app/
│   │   ├── (public)/           # Landing, Login, Register, Verify Email
│   │   └── (protected)/        # Dashboard, My Files, File Details, Admin
│   ├── components/
│   │   ├── ui/                 # Accessible UI Primitives (Button, Modal, Card, Badge)
│   │   ├── layout/             # Navbar, Sidebar, Header, Footer
│   │   └── files/              # FileUploadModal, DeleteFileModal
│   ├── providers/              # AuthProvider, ToastProvider, QueryProvider
│   └── lib/                    # Axios client & formatting utilities
│
├── server/                     # Express 5 Backend REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, VerificationCode, File)
│   │   ├── migrations/         # PostgreSQL migration history
│   │   └── seed.ts             # Idempotent Admin user seed script
│   ├── src/
│   │   ├── config/             # Environment, Prisma, CORS, Cloudinary, Constants
│   │   ├── middleware/         # Auth, RBAC, Upload, Zod Validate, RateLimit, ErrorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # Register, Verify OTP, Resend, Login, Logout, Profile
│   │   │   ├── files/          # Upload, List, Details, Stream Download, Delete
│   │   │   ├── users/          # Admin User Management & Role Updates
│   │   │   └── stats/          # Personal & System-wide Metrics
│   │   ├── services/           # Token, Password, OTP, Mail, Storage, Extraction
│   │   └── utils/              # AppError, Response envelopes, Sanitizer
│   ├── tests/                  # Vitest + Supertest automated suites
│   ├── api/index.ts            # Vercel Serverless Function entry point
│   ├── vercel.json             # Vercel deployment configuration
│   └── render.yaml             # Render Infrastructure-as-Code blueprint
│
└── docs/                       # Complete 35-Document Architectural Package
```

---

## ⚙️ Environment Variables Reference

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (`server/.env`)
```env
PORT=8080
NODE_ENV=development

DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"

JWT_SECRET=your-secure-32-byte-secret-key
JWT_EXPIRES_IN=7d

ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin
ADMIN_PASSWORD=Admin123

GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_character_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=filox

FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

MAX_FILE_SIZE_MB=10
MAX_FILES_PER_UPLOAD=5
OTP_TTL_MINUTES=10
```

---

## 🚀 Quick Start — Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: Local instance or free [Neon](https://neon.tech) cloud database

### 2. Backend Setup
```bash
cd server
npm install

# Create .env from template and configure DATABASE_URL
cp .env.example .env

# Run database migrations and seed default admin
npx prisma migrate dev
npm run db:seed

# Start backend development server (runs on port 8080)
npm run dev
```

### 3. Frontend Setup
```bash
# In a separate terminal
cd client
npm install

# Create .env.local
cp .env.local.example .env.local

# Start Next.js development server (runs on port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser to access the application.

---

## 🌐 API Reference Matrix

All endpoints are prefixed with `/api` (except `/health`) and use standardized response envelopes:

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/health` | Public | Platform health & uptime probe |
| `POST` | `/api/auth/register` | Public | Register new user & send OTP |
| `POST` | `/api/auth/verify-email` | Public | Verify 6-digit OTP code |
| `POST` | `/api/auth/resend-code` | Public | Request fresh OTP code |
| `POST` | `/api/auth/login` | Public | Authenticate and issue httpOnly cookie |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/auth/profile` | User | Get current session details |
| `POST` | `/api/files/upload` | User | Upload up to 5 files with extraction |
| `GET` | `/api/files` | User | List, search, filter, and paginate files |
| `GET` | `/api/files/:id` | User | Get file metadata & extracted text |
| `GET` | `/api/files/:id/download` | User | Stream preview or download file |
| `DELETE`| `/api/files/:id` | User | Delete database record & cloud blob |
| `GET` | `/api/stats/me` | User | Personal vault statistics |
| `GET` | `/api/stats/admin` | Admin | System KPIs & 30-day activity trend |
| `GET` | `/api/users` | Admin | Paginated user management table |
| `PATCH` | `/api/users/:id/role` | Admin | Change role (`USER` ↔ `ADMIN`) |
| `DELETE`| `/api/users/:id` | Admin | Cascade delete user & all files |

---

## 🧪 Automated Testing

The backend includes automated unit and integration tests powered by **Vitest** and **Supertest**:

```bash
cd server
npm test
```

```text
✓ tests/health.test.ts (2 tests)
✓ tests/files.test.ts  (6 tests)
✓ tests/auth.test.ts   (7 tests)
✓ tests/users.test.ts  (6 tests)

Test Files: 4 passed (4)
Tests:      21 passed (21)
```

---

## ☁️ Deployment Guide (Vercel & Render)

### Deploying Frontend to Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set Framework Preset to `Next.js`.
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app` (or your Render URL).
5. Deploy.

### Deploying Backend to Vercel (Serverless)
1. Import the repository as a separate project in [Vercel](https://vercel.com).
2. Set **Root Directory** to `server`.
3. Vercel automatically detects [`server/vercel.json`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/server/vercel.json) and routes requests through [`server/api/index.ts`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/server/api/index.ts).
4. Configure all environment variables from `server/.env.example` in the Vercel project settings.
5. Deploy.

### Deploying Backend to Render (Alternative)
1. In [Render](https://render.com), create a new **Web Service** from [`server/render.yaml`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/server/render.yaml).
2. Configure your `DATABASE_URL`, `JWT_SECRET`, and `CLOUDINARY_*` secrets.
3. Render automatically executes `npm ci && npm run build` and runs migrations before launch.

---

## 📚 Complete Documentation Index

Detailed architectural specifications, ADRs, user flows, and diagrams are stored in the [`docs/`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/) directory:

- [`01-Product-Requirements-Document.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/01-Product-Requirements-Document.md) — Executive PRD
- [`02-Software-Requirements-Specification.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/02-Software-Requirements-Specification.md) — Comprehensive SRS
- [`09-Database-Design-and-Data-Dictionary.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/09-Database-Design-and-Data-Dictionary.md) — Schema & Indexes
- [`11-API-Specification.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/11-API-Specification.md) — REST API Specification
- [`12-Authentication-and-Authorization.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/12-Authentication-and-Authorization.md) — Security Architecture
- [`13-File-Upload-and-Processing.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/13-File-Upload-and-Processing.md) — Pipeline & Magic Bytes
- [`24-Deployment-Architecture.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/24-Deployment-Architecture.md) — Multi-cloud Architecture
- [`25-Environment-Variables.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/25-Environment-Variables.md) — Configuration Reference
- [`30-Assumptions-and-Decisions.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/30-Assumptions-and-Decisions.md) — Architecture Decision Records (ADRs)
- [`35-Final-Submission-Checklist.md`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/docs/35-Final-Submission-Checklist.md) — Verification Audit Checklist

---

## 👨‍💻 Author

**Mohand Hatem** — Full Stack Web Developer
