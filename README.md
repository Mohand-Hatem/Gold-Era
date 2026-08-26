# Managing Your Files

A full-stack file management system built as part of a Full Stack Developer technical assessment.

The application allows authenticated users to securely upload, organize, search, and manage their files, while administrators can manage users, files, and system statistics through a dedicated admin dashboard.

## 🚀 Live Demo

- **Frontend:** `YOUR_FRONTEND_URL`
- **Backend API:** `YOUR_BACKEND_URL`

## 📌 Project Overview

Managing Your Files is a modern full-stack application designed around secure file management and role-based access control.

The system provides:

- User registration and authentication
- Email verification using OTP
- JWT authentication
- Role-based authorization
- Multiple file uploads
- Drag & drop uploads
- Upload progress tracking
- File validation
- File metadata and extracted content
- Search, filtering, sorting, and pagination
- User statistics and dashboards
- Admin user management
- Admin file management
- Admin statistics
- Responsive and modern UI

## 🛠️ Technology Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack React Query
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Multer

### Development & Deployment

- Git / GitHub
- Vercel
- Railway / Render
- PostgreSQL

## 🏗️ Architecture

The project follows a modular architecture with a clear separation between frontend and backend.

```text
Managing-Your-Files/
│
├── client/                      # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── providers/
│   ├── types/
│   └── utils/
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── files/
│   │   │   └── stats/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── prisma/
│       └── schema.prisma
│
└── docs/                        # Project documentation
```

## 👥 User Roles

### User

Authenticated users can:

- Manage their profile
- Upload files
- Upload multiple files
- Drag and drop files
- View their own files
- Search files
- Filter files
- Sort files
- Paginate files
- View file details
- View file metadata
- View extracted content
- Delete their own files
- View personal statistics

### Admin

Administrators can:

- Access the admin dashboard
- View system statistics
- View users
- Search users
- Update user roles
- Delete users
- View all files
- Search files
- Filter files
- Delete files
- View recent uploads

> Admin authorization is enforced on the backend. Frontend route protection is used additionally for user experience and navigation control.

## 🔐 Authentication & Authorization

The application implements:

- User registration
- Password hashing
- Email verification through OTP
- OTP resend
- JWT-based authentication
- Protected routes
- Role-based authorization
- User/Admin permissions
- Token expiration handling

### Authentication Flow

```text
Register
   ↓
Create User
   ↓
Generate OTP
   ↓
Send Verification Email
   ↓
Verify Email
   ↓
Login
   ↓
Issue JWT
   ↓
Access Protected Resources
```

## 📁 File Management

Users can upload and manage files through a dedicated file management interface.

### Upload Features

- Drag & Drop
- Multiple files
- Upload progress
- Client-side validation
- Server-side validation
- File size validation
- File type validation
- Metadata extraction
- Content extraction where supported

### File Information

The application can display:

- Original file name
- File type
- MIME type
- File size
- Upload date
- Extracted content
- File URL/path where applicable

## 🔎 File Search, Filter & Pagination

The file management interface supports:

- Keyword search
- File type filtering
- Sorting
- Pagination
- Empty states
- Loading states
- Error handling

## 📊 Statistics

### User Dashboard

Users can view:

- Total uploaded files
- Storage usage
- File type distribution
- Upload history

### Admin Dashboard

Administrators can view:

- Total users
- Total files
- Storage usage
- Most uploaded file types
- Recent uploads

## 🗄️ Database

The application uses Prisma ORM with PostgreSQL.

### Main Entities

```text
User
 ├── VerificationCode
 └── File
```

### User

Stores:

- Account information
- Authentication data
- Role
- Email verification status
- Timestamps

### VerificationCode

Stores:

- Verification code
- Associated user
- Expiration
- Creation timestamp

### File

Stores:

- File ownership
- Original file name
- File type
- MIME type
- Size
- Storage information
- Extracted content
- Timestamps

## 🌐 API

The backend exposes RESTful APIs.

### Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/verify-email
POST /auth/resend-code
GET  /auth/profile
```

### Users

```http
GET    /users
PATCH  /users/:id
DELETE /users/:id
```

### Files

```http
POST   /files/upload
GET    /files
GET    /files/:id
DELETE /files/:id
```

### Statistics

```http
GET /stats/user
GET /stats/admin
```

Authentication and authorization requirements vary by endpoint.

## ⚙️ Environment Variables

### Frontend

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend

Create a `.env` file:

```env
PORT=8080

DATABASE_URL=

JWT_SECRET=

ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin
ADMIN_PASSWORD=Admin123

GMAIL_USER=
GMAIL_PASS=
```

Never commit `.env` files or production secrets to GitHub.

## 📦 Installation

### Prerequisites

Make sure you have installed:

- Node.js 20+
- npm
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Managing-Your-Files
```

## ▶️ Backend Setup

```bash
cd server
npm install
```

Configure the `.env` file, then run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:8080
```

## ▶️ Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

## 🔄 Development Workflow

Recommended implementation order:

```text
1. Project Setup
2. Database Design
3. Backend Foundation
4. Authentication
5. Authorization
6. File Upload
7. File Management
8. Statistics
9. Frontend Foundation
10. Authentication UI
11. File Management UI
12. User Dashboard
13. Admin Dashboard
14. Frontend/Backend Integration
15. Testing
16. Deployment
17. Final Review
```

## 🧪 Testing

The project should focus testing on critical business flows.

### Authentication

- Registration
- Duplicate email
- OTP verification
- Invalid OTP
- Expired OTP
- Resend OTP
- Login
- Invalid credentials
- Protected routes

### Authorization

- User accessing own resources
- User accessing another user's resources
- Admin-only endpoints
- Unauthorized role access

### File Management

- Valid upload
- Multiple upload
- Invalid file type
- File too large
- Empty upload
- Upload failure
- File deletion
- File ownership

### Query Features

- Search
- Filtering
- Sorting
- Pagination

## 🔒 Security Considerations

The application considers:

- Password hashing
- JWT validation
- Role-based authorization
- Input validation
- File type validation
- File size limits
- Secure environment variables
- CORS configuration
- OTP expiration
- OTP abuse protection
- Unauthorized file access
- Filename/path security
- Database access through Prisma

## 📱 Responsive Design

The frontend is designed to support:

- Desktop
- Tablet
- Mobile

The UI includes responsive layouts, reusable components, loading states, empty states, error states, and toast notifications.

## 🎨 UI / UX

The interface uses:

- Tailwind CSS for styling
- Framer Motion for animations
- Responsive layouts
- Reusable UI components
- Consistent form validation
- Loading indicators
- Error feedback
- Toast notifications

## 📚 Documentation

Detailed project documentation is available inside:

```text
docs/
```

The documentation covers:

- Product Requirements
- Software Requirements
- Business Flows
- User Flows
- Use Cases
- Database Design
- ERD
- API Specification
- Authentication
- File Upload Architecture
- Frontend Architecture
- Backend Architecture
- Security
- Testing
- Deployment
- Development Phases
- Requirements Traceability
- Acceptance Criteria

## 🚀 Deployment

### Frontend

Recommended platform:

```text
Vercel
```

Configure:

```env
NEXT_PUBLIC_API_URL=YOUR_PRODUCTION_API_URL
```

### Backend

Recommended platforms:

```text
Railway
Render
Fly.io
```

Configure all required production environment variables.

### Database

Use a managed PostgreSQL database in production.

Before starting the production server:

```bash
npx prisma migrate deploy
npx prisma generate
```

## 🏥 Health Check

The backend should expose a simple health endpoint for deployment and monitoring.

Example:

```http
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

## 📌 Assumptions

Where the assessment did not define specific behavior, reasonable technical assumptions were made and documented separately.

Examples include:

- Maximum file size
- Supported file formats
- OTP expiration
- Pagination defaults
- File deletion behavior
- Content extraction scope
- Token expiration
- Duplicate file behavior

See:

```text
docs/30-Assumptions-and-Decisions.md
```

## ⚖️ Scope & Trade-offs

This project is designed as an 8–10 hour technical assessment.

The implementation prioritizes:

1. Core business requirements
2. Authentication and authorization
3. File management
4. Admin functionality
5. API quality
6. Security
7. Responsive UX
8. Testing of critical flows

Optional features such as advanced OCR, complex folder hierarchies, collaboration, and microservices are intentionally outside the core MVP scope unless additional time is available.

## ✅ Final Submission Checklist

Before submitting the assessment:

- [ ] Frontend works in production
- [ ] Backend works in production
- [ ] Database is connected
- [ ] Registration works
- [ ] Login works
- [ ] OTP verification works
- [ ] JWT authentication works
- [ ] User/Admin authorization works
- [ ] File upload works
- [ ] Multiple upload works
- [ ] File validation works
- [ ] File listing works
- [ ] Search works
- [ ] Filter works
- [ ] Sort works
- [ ] Pagination works
- [ ] File details work
- [ ] File deletion works
- [ ] User statistics work
- [ ] Admin dashboard works
- [ ] Admin user management works
- [ ] Admin file management works
- [ ] Error handling works
- [ ] Responsive design works
- [ ] Environment variables are configured
- [ ] No secrets are committed
- [ ] README is complete
- [ ] GitHub repository is clean
- [ ] Production URLs are working

## 👨‍💻 Author

**Mohand Hatem**

Full Stack Web Developer

---

## 📄 License

This project was developed as part of a technical hiring assessment.
