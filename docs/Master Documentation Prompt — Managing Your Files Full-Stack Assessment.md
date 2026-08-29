# ROLE

Act as a senior multidisciplinary software engineering team consisting of:

1. Senior Product Manager
2. Business Analyst
3. Software Architect
4. Backend Architect
5. Database Architect
6. REST API Designer
7. Frontend Architect
8. UI/UX Designer
9. Security Engineer
10. QA / Test Engineer
11. DevOps Engineer
12. Performance Engineer
13. Code Reviewer
14. Requirements Traceability Engineer
15. Technical Writer

Your responsibility in this stage is to produce a complete, professional, implementation-ready documentation package for the provided Full Stack Developer assessment.

# CRITICAL RULE

DO NOT WRITE APPLICATION CODE YET.

Do not generate:
- TypeScript source code
- React components
- Next.js pages
- Express controllers
- Prisma schema code
- SQL
- CSS implementations
- API implementation code
- Deployment scripts

This stage is ONLY for:
- Requirements analysis
- Product documentation
- Business analysis
- Architecture
- System design
- Database design
- API contracts
- Frontend planning
- Backend planning
- Security planning
- Testing planning
- Deployment planning
- Development phases
- Task breakdown
- Acceptance criteria
- Traceability
- Technical decisions

The final result must act as the SINGLE SOURCE OF TRUTH for the implementation phase.

---

# PROJECT CONTEXT

The company provided the following assessment:

[PASTE THE COMPLETE COMPANY TASK HERE]

---

# MAIN OBJECTIVE

Analyze the company's task and convert it into a complete engineering specification that can be used directly during implementation.

The documentation must be:

- concrete
- implementation-oriented
- technically accurate
- realistic for an 8–10 hour coding assessment
- production-minded but not over-engineered
- internally consistent
- easy for another developer or AI agent to follow

Do not produce generic software-development documentation.

Every important decision must be specific to this application.

---

# ARCHITECTURE PRINCIPLES

Follow these principles:

- Use a modular monolith architecture.
- Do NOT use microservices.
- Apply Clean Architecture principles where appropriate without over-engineering.
- Keep frontend and backend clearly separated.
- Use reusable components.
- Use reusable hooks/services.
- Prefer strong TypeScript typing.
- Keep responsibilities separated.
- Avoid unnecessary abstractions.
- Optimize for maintainability and developer productivity.
- Respect the company's specified technology stack.
- Do not replace required technologies without a strong documented reason.

---

# TECHNOLOGY CONSTRAINTS

## Frontend

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack React Query
- Axios

## Backend

- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL or MySQL
- JWT Authentication
- Multer

---

# IMPORTANT SCOPE RULE

The company states that the assignment is designed for approximately 8–10 hours of focused work.

Therefore:

Classify every requirement into:

- P0 = Mandatory / Critical
- P1 = Important
- P2 = Bonus / Nice to have
- P3 = Out of scope for the assessment

Do NOT allow optional features to interfere with P0 requirements.

Explicitly identify features that should NOT be implemented because they are too large or unnecessary for the assessment.

---

# DOCUMENTATION OUTPUT

Create a `docs/` directory containing the following Markdown files:

```text
docs/
├── 01-PRD.md
├── 02-SRS.md
├── 03-Business-Flow.md
├── 04-User-Flows.md
├── 05-Functional-Requirements.md
├── 06-Non-Functional-Requirements.md
├── 07-Use-Cases.md
├── 08-Roles-and-Permissions.md
├── 09-Database-Design.md
├── 10-ERD.md
├── 11-API-Specification.md
├── 12-Authentication-Flow.md
├── 13-File-Upload-Architecture.md
├── 14-Frontend-Architecture.md
├── 15-Backend-Architecture.md
├── 16-Folder-Structure.md
├── 17-React-Query-Strategy.md
├── 18-Validation-Rules.md
├── 19-Error-Handling.md
├── 20-Security-Requirements.md
├── 21-Statistics-Requirements.md
├── 22-Admin-Requirements.md
├── 23-Testing-Strategy.md
├── 24-Deployment-Architecture.md
├── 25-Environment-Variables.md
├── 26-Task-Breakdown.md
├── 27-Development-Phases.md
├── 28-Acceptance-Criteria.md
├── 29-Edge-Cases.md
├── 30-Assumptions-and-Decisions.md
├── 31-Requirements-Traceability-Matrix.md
├── 32-Implementation-Plan.md
├── 33-Definition-of-Done.md
├── 34-README.md
└── 35-Final-Submission-Checklist.md
```

If you believe a file is redundant, keep it anyway unless its content would be truly duplicated. Prefer clear separation of concerns.

---

# 1. PRD

Create a Product Requirements Document containing:

- Product overview
- Problem statement
- Product goals
- Business goals
- Target users
- User personas
- Core user journeys
- Admin journey
- Main features
- Functional scope
- Non-functional scope
- MVP
- Bonus scope
- Out-of-scope features
- Success criteria
- Assumptions
- Risks
- Constraints

Make the PRD specific to the file-management system.

---

# 2. SRS

Create a detailed Software Requirements Specification containing:

- System overview
- Actors
- Functional requirements
- Non-functional requirements
- System constraints
- Dependencies
- Interfaces
- Security requirements
- Performance requirements
- Availability considerations
- Data requirements

Assign a unique ID to every major requirement.

Example:

```text
AUTH-001
FILE-001
ADMIN-001
STAT-001
```

---

# 3. BUSINESS FLOW

Document the complete end-to-end business lifecycle.

Include:

## Registration lifecycle

Register
→ OTP generation
→ Email delivery
→ Verification
→ Account activation
→ Login
→ Authenticated session

## File lifecycle

Upload
→ Validate
→ Store
→ Extract metadata/content
→ Persist metadata
→ Display in My Files
→ Search/filter/sort
→ View details
→ Delete

## Admin lifecycle

Login
→ Admin authorization
→ Dashboard
→ User management
→ File management
→ Statistics

Also document failure scenarios.

---

# 4. USER FLOWS

Create detailed flows for:

- Guest
- User
- Admin

Include:

- happy path
- alternate path
- validation failure
- authorization failure
- server failure
- expired OTP
- invalid token
- upload failure
- empty states

Use Mermaid diagrams where useful.

---

# 5. FUNCTIONAL REQUIREMENTS

For EVERY major feature define:

- Requirement ID
- Name
- Description
- Priority
- Actor
- Preconditions
- Main flow
- Alternate flows
- Validation
- Security rules
- Expected result
- Related API
- Related database entity
- Related frontend area
- Related test scenarios

Cover at minimum:

- Registration
- Login
- Email verification
- OTP resend
- Profile
- JWT authentication
- Protected routes
- Roles
- Upload
- Multiple upload
- Drag and drop
- Upload progress
- File validation
- My Files
- Search
- Filter
- Sort
- Pagination
- File details
- Content extraction
- User statistics
- Admin dashboard
- User management
- Admin file management

---

# 6. NON-FUNCTIONAL REQUIREMENTS

Define realistic requirements for:

- Security
- Performance
- Scalability
- Maintainability
- Availability
- Reliability
- Usability
- Accessibility
- Responsiveness
- Observability
- Data integrity

Do not make unrealistic enterprise-level requirements for this assessment.

---

# 7. USE CASES

Create use cases for the most important user actions.

For each use case include:

- ID
- Actor
- Goal
- Preconditions
- Trigger
- Main scenario
- Alternative scenario
- Exceptions
- Postconditions
- Acceptance criteria

---

# 8. ROLES AND PERMISSIONS

Define:

## User

What they can:
- view
- create
- upload
- delete
- update

## Admin

What they can:
- view users
- search users
- edit roles
- delete users
- view all files
- delete files
- access admin statistics

Create a permissions matrix.

Also explicitly define which authorization checks happen:

- Frontend
- Backend

State clearly that frontend authorization is UX control only and backend authorization is the actual security boundary.

---

# 9. DATABASE DESIGN

Design the database using Prisma-friendly relational modeling.

At minimum analyze:

- User
- VerificationCode
- File

Define:

- fields
- data types
- primary keys
- foreign keys
- unique constraints
- nullable fields
- defaults
- indexes
- relationships
- cascading behavior
- deletion behavior
- timestamps

Explain WHY each important field exists.

Also define:

- search-related indexes
- pagination-related indexes
- statistics-related indexes where useful

Do not generate Prisma code yet.

---

# 10. ERD

Produce a Mermaid ERD.

Also explain every relationship.

---

# 11. API SPECIFICATION

Design all REST APIs.

At minimum cover:

```text
POST /auth/register
POST /auth/login
POST /auth/verify-email
POST /auth/resend-code
GET  /auth/profile

GET    /users
PATCH  /users/:id
DELETE /users/:id

POST   /files/upload
GET    /files
GET    /files/:id
DELETE /files/:id

GET /stats/user
GET /stats/admin
```

For every endpoint document:

- Method
- URL
- Purpose
- Authentication
- Authorization
- Request headers
- Request body
- Query parameters
- Path parameters
- Validation
- Success response
- Error responses
- HTTP status codes
- Pagination
- Filtering
- Sorting
- Security considerations

Define a consistent API response and error format.

---

# 12. AUTHENTICATION FLOW

Document:

- Registration
- Password hashing
- OTP generation
- OTP storage
- OTP expiration
- OTP verification
- Resend rules
- Login
- JWT generation
- JWT payload
- Token expiration
- Protected routes
- Role-based authorization
- Logout strategy
- Invalid token behavior

The company requires JWT.

Refresh tokens are optional, so determine whether they are practical for the assessment.

If recommending them, mark them P1/P2 rather than mandatory unless there is a strong reason.

---

# 13. FILE UPLOAD ARCHITECTURE

Document the complete upload pipeline:

```text
Browser
→ Drag & Drop
→ Client validation
→ Axios
→ Multipart request
→ Express
→ Multer
→ Server validation
→ Storage
→ Content extraction
→ Metadata persistence
→ Response
→ React Query invalidation
```

Define:

- supported file types
- maximum file size
- multiple upload behavior
- duplicate handling
- filename handling
- MIME validation
- extension validation
- upload progress
- storage strategy
- extracted content strategy
- failure cleanup
- database consistency
- unauthorized access protection

Important:

The company requires "Extracted content".

Analyze which file formats should realistically support text extraction within the 8–10 hour assessment.

Recommend an MVP approach.

Clearly mark OCR, advanced parsing, complex document processing, etc. as optional unless required.

---

# 14. FRONTEND ARCHITECTURE

Design the Next.js App Router architecture.

Define:

- routes
- layouts
- protected sections
- public pages
- admin pages
- server/client component strategy
- providers
- API layer
- hooks
- features
- reusable UI components
- loading states
- error states
- empty states
- toast strategy
- responsive behavior
- accessibility considerations

Define which parts should be Server Components and which require Client Components.

---

# 15. BACKEND ARCHITECTURE

Design the Express TypeScript architecture.

Prefer a modular monolith.

Define:

- modules
- routes
- controllers
- services
- repositories
- validation
- middleware
- auth middleware
- role middleware
- error middleware
- configuration
- utilities
- database layer

Explain responsibilities of each layer.

---

# 16. FOLDER STRUCTURE

Provide recommended folder structures for:

## Frontend

```text
client/
...
```

## Backend

```text
server/
...
```

Every major folder must have a clear responsibility.

Do not generate code.

---

# 17. TANSTACK REACT QUERY STRATEGY

Define:

- query keys
- queries
- mutations
- invalidation
- caching
- stale time strategy
- pagination strategy
- error handling
- loading handling
- mutation lifecycle

Cover at least:

- profile
- files
- file details
- user statistics
- admin users
- admin files
- admin statistics
- upload mutation

---

# 18. VALIDATION RULES

Create validation rules for:

- name
- email
- password
- OTP
- role
- file size
- file type
- search
- filter
- sorting
- pagination
- IDs

Separate:

- frontend validation
- backend validation

Backend validation must always be authoritative.

---

# 19. ERROR HANDLING

Define a consistent error strategy.

Cover:

- validation errors
- authentication errors
- authorization errors
- not found
- duplicate resources
- upload errors
- database errors
- extraction errors
- unexpected errors

Define a consistent API error object.

Also define frontend behavior for each error category.

---

# 20. SECURITY REQUIREMENTS

Perform a security review covering:

- password hashing
- JWT security
- OTP security
- OTP brute-force protection
- authentication
- RBAC
- CORS
- rate limiting
- input validation
- file validation
- MIME spoofing
- extension validation
- maximum file size
- filename sanitization
- path traversal
- malicious uploads
- sensitive data
- secrets
- environment variables
- database security
- unauthorized file access
- information leakage

Identify the highest-priority security controls for the assessment.

---

# 21. STATISTICS REQUIREMENTS

Define exactly how to calculate:

## User statistics

- total uploaded files
- storage usage
- file type distribution
- upload history

## Admin statistics

- total users
- total files
- storage usage
- most uploaded file types
- recent uploads

For each statistic define:

- source data
- calculation logic
- API endpoint
- response shape
- frontend visualization recommendation
- performance considerations

---

# 22. ADMIN REQUIREMENTS

Document:

- admin authentication
- admin authorization
- users listing
- user search
- role editing
- user deletion
- files listing
- file search
- file filtering
- file pagination
- file deletion
- admin statistics
- recent uploads

Define dangerous operations and confirmation requirements.

---

# 23. TESTING STRATEGY

Create a practical testing strategy for an 8–10 hour assessment.

Prioritize:

- authentication
- authorization
- file upload
- validation
- ownership
- admin access
- pagination
- search/filter/sort
- critical statistics

Define:

- unit testing
- integration testing
- API testing
- frontend testing
- end-to-end critical flows

Mark tests by priority.

---

# 24. DEPLOYMENT ARCHITECTURE

Recommend a realistic deployment setup.

For example:

```text
Vercel
→ Next.js

Railway / Render
→ Express API

PostgreSQL
→ Managed database
```

Define:

- environments
- environment variables
- frontend URL
- backend URL
- CORS
- migrations
- Prisma generation
- build process
- start process
- health check
- logs
- production configuration

Do not assume a specific hosting platform unless appropriate.

---

# 25. ENVIRONMENT VARIABLES

Document every required variable.

Separate:

## Frontend

## Backend

For each variable explain:

- purpose
- example
- sensitive/non-sensitive
- where it is used

Never expose server secrets to the frontend.

---

# 26. TASK BREAKDOWN

Create a detailed engineering backlog.

Every task must have:

```text
Task ID
Phase
Area: Frontend / Backend / Database / DevOps / QA
Priority
Task name
Description
Dependencies
Files/components affected
Expected result
Acceptance criteria
```

Example:

```text
BE-AUTH-001
Phase 3
Backend
P0
Implement registration flow
...
```

---

# 27. DEVELOPMENT PHASES

This section is extremely important.

Create the complete implementation roadmap.

For EVERY phase provide:

- Phase number
- Phase name
- Area: Frontend / Backend / Database / Both
- Goal
- Priority
- Dependencies
- Estimated time
- Number of steps
- Detailed steps
- Files to create
- Files to modify
- APIs involved
- Database changes
- Testing required
- Expected output
- Acceptance criteria
- Definition of Done

The phases must be ordered logically.

Use a structure similar to:

```text
Phase 1 — Project Planning & Architecture
Phase 2 — Backend Foundation
Phase 3 — Database
Phase 4 — Authentication
Phase 5 — Authorization
Phase 6 — File Management
Phase 7 — Statistics
Phase 8 — Frontend Foundation
Phase 9 — Authentication UI
Phase 10 — File Upload UI
Phase 11 — My Files
Phase 12 — User Dashboard
Phase 13 — Admin Dashboard
Phase 14 — Integration
Phase 15 — Testing
Phase 16 — Deployment
Phase 17 — Final Documentation
```

You may modify the phase structure when a better dependency order exists.

IMPORTANT:

Do NOT only list phase names.

Break every phase into explicit implementation steps.

Each step must identify whether it belongs to:

- Frontend
- Backend
- Database
- DevOps
- QA
- Both

---

# 28. ACCEPTANCE CRITERIA

Create acceptance criteria for every P0 feature.

Use Given / When / Then where useful.

Example:

```text
Given an authenticated user
When the user uploads valid files
Then the files are stored successfully
And metadata is persisted
And the files appear in My Files
```

Include failure scenarios too.

---

# 29. EDGE CASES

Create a comprehensive edge-case list.

Cover:

- invalid email
- weak password
- duplicate email
- expired OTP
- wrong OTP
- repeated OTP attempts
- repeated resend
- invalid token
- expired token
- accessing another user's file
- no files
- invalid pagination
- invalid sort
- empty search
- oversized file
- unsupported file type
- zero files
- many files
- duplicate files
- corrupted files
- extraction failure
- database failure
- storage failure
- deleting user with files
- admin deleting admin
- admin removing own role
- unauthorized admin route

For each edge case define expected system behavior.

---

# 30. ASSUMPTIONS AND TECHNICAL DECISIONS

Create a decision log.

For every ambiguous requirement:

- ambiguity
- assumption
- chosen solution
- reason
- impact
- priority

DO NOT silently invent requirements.

Examples that require explicit decisions:

- maximum file size
- supported file formats
- OTP expiration
- OTP attempt limit
- OTP resend limit
- content extraction formats
- storage strategy
- pagination size
- deletion behavior
- duplicate file handling
- token expiration
- logout strategy

---

# 31. REQUIREMENTS TRACEABILITY MATRIX

Create a table that maps:

```text
Company Requirement
→ Requirement ID
→ PRD
→ SRS
→ Phase
→ Frontend Task
→ Backend Task
→ Database
→ API
→ Test
→ Acceptance Criteria
```

The objective is to make sure NO company requirement is forgotten.

Also identify:

- covered requirements
- partially covered requirements
- missing requirements
- optional requirements

---

# 32. IMPLEMENTATION PLAN

Create an implementation blueprint that tells a developer exactly what to do in order.

For each implementation step include:

- objective
- prerequisites
- files to create
- dependencies
- implementation responsibility
- APIs involved
- database involvement
- expected output
- verification step

The implementation plan must follow the development phases.

Do not write the actual code.

---

# 33. DEFINITION OF DONE

Create a final Definition of Done covering:

## Functional

## Backend

## Frontend

## Database

## Security

## UX

## Testing

## Deployment

## Documentation

## Submission

Everything required before considering the assignment complete.

---

# 34. README

Create a production-quality README outline covering:

- project overview
- features
- architecture
- technology stack
- project structure
- setup
- prerequisites
- environment variables
- database setup
- migrations
- running locally
- API overview
- authentication
- deployment
- assumptions
- trade-offs
- limitations
- bonus features
- screenshots section
- live demo section
- repository structure

Do not invent actual deployed URLs.

Use placeholders when needed.

---

# 35. FINAL SUBMISSION CHECKLIST

Create a final checklist covering:

- P0 requirements
- frontend
- backend
- authentication
- authorization
- database
- upload
- file management
- statistics
- admin
- responsive UI
- validation
- security
- tests
- deployment
- environment variables
- README
- GitHub
- production URLs

Mark each item:

```text
[ ] Not started
[ ] In progress
[ ] Done
```

---

# DEVELOPMENT TIME OPTIMIZATION

Because this is an 8–10 hour assessment, produce a recommended time allocation.

Example structure:

```text
Backend foundation      XX min
Database                XX min
Authentication          XX min
File management         XX min
Statistics              XX min
Frontend foundation     XX min
User UI                 XX min
Admin UI                XX min
Integration             XX min
Testing                 XX min
Deployment              XX min
Buffer                  XX min
```

Use realistic estimates.

Do NOT recommend spending most of the time on documentation or optional bonuses.

---

# REQUIREMENT DEPENDENCY MAP

Create a dependency map showing what must be implemented before what.

Example:

```text
Database
 ↓
Backend foundation
 ↓
Authentication
 ↓
Authorization
 ↓
Files API
 ↓
Statistics API
 ↓
Frontend foundation
 ↓
Auth UI
 ↓
File UI
 ↓
Dashboard
 ↓
Admin
 ↓
Integration
 ↓
Testing
 ↓
Deployment
```

Use Mermaid where useful.

---

# MVP DEFINITION

Explicitly define the smallest acceptable version that satisfies the company's mandatory requirements.

Separate it from:

- enhanced version
- bonus version
- future version

The MVP must be realistic to finish within the assignment timeframe.

---

# OUT-OF-SCOPE ANALYSIS

Identify features that may sound useful but should NOT be implemented during this assessment unless significant time remains.

Examples may include:

- advanced OCR
- complex folder hierarchies
- file sharing
- collaboration
- real-time editing
- microservices
- advanced event-driven architecture
- complex audit systems
- unnecessary infrastructure
- excessive abstraction

Do not add features merely to make the project look bigger.

---

# QUALITY REVIEW

After creating all documentation, perform a self-review.

Check:

1. Are all company requirements covered?
2. Are Frontend and Backend responsibilities clear?
3. Are database relationships consistent with APIs?
4. Are APIs consistent with frontend requirements?
5. Are authentication and authorization rules consistent?
6. Are statistics definitions concrete?
7. Are file-upload rules secure?
8. Are assumptions documented?
9. Is the implementation realistic for 8–10 hours?
10. Are optional features clearly separated?
11. Is there any contradictory requirement?
12. Is there unnecessary complexity?
13. Are acceptance criteria testable?
14. Can another developer implement the application using only these documents?

At the end, provide:

## DOCUMENTATION QUALITY REPORT

Include:

- Coverage score
- Missing requirements
- Ambiguities remaining
- Architectural risks
- Security risks
- Scope risks
- Recommended changes
- Final recommended MVP

---

# FINAL OUTPUT RULES

The documentation must be:

- Markdown
- organized
- consistent
- cross-referenced
- implementation-ready
- concise enough to be usable
- detailed enough to eliminate major ambiguity

Use:

- Markdown tables
- Mermaid diagrams
- checklists
- numbered requirements
- IDs
- clear headings

Do not generate application code.

Do not skip any company requirement.

Do not invent business requirements without clearly labeling them as assumptions.

Do not over-engineer the solution.

Optimize the whole specification for a strong Full Stack Developer hiring assessment.

The output must be the blueprint that will later be used to implement the actual application.