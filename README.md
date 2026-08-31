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

To allow testers, evaluators, and recruiters to easily test both **Admin** and **Standard User** experiences without registering a new account, use the following pre-seeded test credentials:

| Role | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin@example.com` | `Admin123` | • Full system analytics & 30-day activity trend <br/> • User account governance & role promotions <br/> • Cascade user deletion & global file metrics <br/> • Personal storage vault & text extraction |
| 👤 **Standard User** | *(Register instant account)* <br/> *Or create in Admin panel* | *User password* | • Personal isolated file vault (500 MB limit) <br/> • Multi-file drag & drop uploads (PDF, DOCX, CSV, images) <br/> • Automatic text extraction & deep keyword search <br/> • Custom profile image upload |

> [!TIP]
> **Database Seeding:** The seed script automatically creates the pre-verified `admin@example.com` account upon running `npm run db:seed` or deploying on Railway.

---

## ✨ Features & Capabilities

### 🔐 1. Authentication & Security
- **Email Verification OTP:** 6-digit verification code with 60s cooldown timer and 5 resends/hour rate limit.
- **Secure Session Management:** Signed JWT tokens stored in `httpOnly`, `Secure`, `SameSite` cookies with CORS protection.
- **Role-Based Access Control (RBAC):** `ADMIN` and `USER` access guard middleware with self-demotion and self-deletion prevention (`ERR_SELF_DEMOTE`, `ERR_SELF_DELETE`).
- **Profile Picture Upload:** Custom avatar uploading to Cloudinary with interactive camera button and avatar cache synchronization.

### 📁 2. File Ingestion & Intelligent Processing
- **Multi-File Batch Upload:** Drag-and-drop zone supporting up to 5 files per batch (max 10 MB per file).
- **Format Validation & Magic-Byte Sniffing:** Verifies binary signatures for PDF, DOCX, CSV, JSON, TXT, MD, PNG, JPEG, and WebP to block extension spoofing.
- **Automated Text Extraction:** Server-side parsing for PDF (`pdf-parse`), Word documents (`mammoth`), and plaintext without blocking upload completion.
- **Remote Cloud Blob Storage:** Direct streaming to Cloudinary authenticated storage with automatic UUID generation.

### 🔎 3. Deep Search, Views & Filtering
- **Full-Text Keyword Search:** Searches both filenames AND extracted file content with a 300ms debounce.
- **Dual View Modes:** Instant toggle between structured **Table View** and visual **Grid Card View**.
- **Category Filter Chips:** Instant filtering across `Documents`, `Images`, `Spreadsheets / Code`, and `Archives`.
- **Content Inspector:** Detailed file page with SHA-256 checksum, formatted metadata, zoomable image preview, and a 1-click **Copy Extracted Text** button.

### 📊 4. Interactive Dashboards & Metrics
- **Personal Storage Analytics:** Storage consumption bar with warning thresholds and category breakdown.
- **Admin System Overview:** 30-day upload volume curves (`AreaChart`) and global asset distribution (`PieChart`) via **Recharts**.
- **User Governance Directory:** Searchable user table with live role switcher modal and cascade deletion protection.

---

## 🛠️ Technology Stack

```text
Frontend:
  ├── Framework: Next.js 16.3 (App Router with Turbopack)
  ├── Language: TypeScript 5.9
  ├── Styling: Tailwind CSS v4 & Lucide React
  ├── State & Data Fetching: TanStack React Query v5 & Axios
  └── Data Visualization: Recharts

Backend:
  ├── Framework: Express 5.2 (Modular Monolith)
  ├── Language: TypeScript 5.9
  ├── Database & ORM: Prisma 6.19 & PostgreSQL
  ├── Security: Bcrypt (12 rounds), JSONWebToken, Express Rate Limit
  ├── Ingestion & Extraction: Multer, File-Type, pdf-parse, mammoth
  ├── Cloud Storage: Cloudinary SDK
  ├── Email: Nodemailer (SMTP + Console Fallback)
  └── Test Suite: Vitest & Supertest (21 tests)
```

---

## 🏗️ Project Architecture

```text
Gold-Era/
├── client/                     # Next.js 16 Frontend (Deployed on Vercel)
│   ├── app/
│   │   ├── (public)/           # Landing, Login, Register, Verify Email
│   │   ├── (protected)/        # Dashboard, Files Explorer, File Details, Profile, Admin
│   │   └── globals.css         # Tailwind v4 custom tokens, dark mode variants & scrollbars
│   ├── components/
│   │   ├── home/               # Modular landing page sections
│   │   ├── layout/             # Navbar, AppHeader, AppSidebar, Footer
│   │   ├── files/              # FileUploadModal, DeleteFileModal
│   │   └── ui/                 # Accessible UI components (Button, Modal, Card, Badge)
│   ├── providers/              # AuthProvider, ToastProvider, QueryProvider
│   └── lib/                    # Axios client, utils, formatters
│
├── server/                     # Express 5 REST API (Deployed on Railway)
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, VerificationCode, File)
│   │   └── seed.ts             # Idempotent admin seed script
│   ├── src/
│   │   ├── config/             # Environment validation, Prisma, CORS, Cloudinary
│   │   ├── middleware/         # Authenticate, RBAC, Upload, RateLimit, ErrorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # Login, Register, OTP verification, Profile, Avatar
│   │   │   ├── files/          # Upload, List/Search, Details, Download Stream, Delete
│   │   │   ├── users/          # Admin user management & role changes
│   │   │   └── stats/          # Personal & platform analytics
│   │   ├── services/           # Token, Password, Mail, Storage, Text Extraction
│   │   └── utils/              # AppError, Response helpers, AsyncHandler
│   ├── tests/                  # Vitest + Supertest automated test suite
│   ├── railway.json            # Railway deployment blueprint & health check
│   └── nixpacks.toml           # Nixpacks Node.js 22 + OpenSSL build recipe
└── docs/                       # Architectural documentation package
```

---

## 🚀 Quick Start — Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **PostgreSQL**: Local database or [Neon](https://neon.tech) cloud PostgreSQL

### 2. Backend Setup
```bash
cd server
npm install

# Create .env from template
cp .env.example .env

# Run database schema push & seed admin account
npx prisma db push
npm run db:seed

# Start backend development server (http://localhost:8080)
npm run dev
```

### 3. Frontend Setup
```bash
# In a separate terminal
cd client
npm install

# Create .env.local
cp .env.example .env.local

# Start Next.js frontend (http://localhost:3000)
npm run dev
```

---

## ☁️ Deployment Instructions

### 1. Backend Deployment on Railway
1. Create a new project on [Railway](https://railway.com/) and provision a **PostgreSQL** database.
2. Link your GitHub repository (`Gold-Era`) and set the **Root Directory** to `server`.
3. Add the required **Environment Variables** in Railway:
   ```env
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secure-32-character-secret-key-here
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://gold-era-front.vercel.app
   ```
4. Railway automatically detects [`server/railway.json`](file:///c:/Users/Mohand/Documents/GitHub/Gold-Era/server/railway.json), runs `npx prisma db push`, and launches the service.

### 2. Frontend Deployment on Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `client`.
3. Add the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://gold-era-production.up.railway.app
   ```
4. Deploy!

---

## 🧪 Automated Testing

Run the full backend test suite with Vitest:

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
