# 04 — User Flows

Detailed flows for Guest, User, and Admin, including happy paths, alternates, and failures. Complements `03` (business lifecycle) with UI-level routing behaviour. Frontend routes are defined in `14`.

## 1. Guest flows

### 1.1 Registration (happy)

```mermaid
flowchart TD
  V[Visit /register] --> F[Fill name/email/password]
  F --> S[Submit]
  S --> OK{201?}
  OK -->|yes| VP[Redirect /verify-email?email=...]
  OK -->|no| ERR[Show field errors / toast]
```

### 1.2 Email verification

```mermaid
flowchart TD
  VP[/verify-email/] --> E[Enter 6-digit code]
  E --> SUB[Submit]
  SUB --> R{result}
  R -->|verified| LOGIN[Redirect /login + success toast]
  R -->|invalid| A[Toast 'invalid code'; stay]
  R -->|expired| RC[Prompt 'Resend code']
  R -->|attempts exceeded| RC
  RC --> RESEND{cooldown ok?}
  RESEND -->|yes| SENT[Toast 'code sent']
  RESEND -->|no| WAIT[Toast 'wait 60s']
```

### 1.3 Login

```mermaid
flowchart TD
  L[/login/] --> C[Enter creds] --> SB[Submit]
  SB --> RES{result}
  RES -->|200| HOME[Cookie set -> redirect /dashboard]
  RES -->|unverified 403| GV[Toast + link to /verify-email]
  RES -->|invalid 401| GEN[Toast 'invalid email or password']
```

### 1.4 Guest hitting a protected route

Guest navigates to `/dashboard` or `/files` → Next.js middleware/layout sees no valid session → redirect to `/login?redirect=<path>`. Backend independently returns 401 if an API call is attempted (security boundary).

### Guest empty/edge states

| Situation | Behaviour |
|---|---|
| Already logged in visits /login or /register | Redirect to /dashboard. |
| Unknown email on resend | Generic handling (see `11` note). |
| Network/server down | Global error toast; retry affordance. |

## 2. User flows

### 2.1 Upload (happy + partial failure)

```mermaid
flowchart TD
  MF[/files or /upload/] --> DZ[Drag files onto dropzone or pick]
  DZ --> CV{client valid?}
  CV -->|no| T1[Toast per-file reason; keep valid ones]
  CV -->|yes| PB[Show progress bars]
  PB --> RESP{server result}
  RESP -->|all ok 201| DONE[Toast 'N uploaded'; invalidate list+stats]
  RESP -->|partial| MIX[Toast 'X ok, Y failed'; show failed reasons]
  RESP -->|all fail 400/415| FAIL[Toast error; nothing added]
```

### 2.2 Browse My Files

```mermaid
flowchart TD
  LIST[/files/] --> LOAD{loading?}
  LOAD -->|yes| SK[Skeleton rows]
  LOAD -->|no| HAS{files?}
  HAS -->|none| EMPTY[Empty state + 'Upload' CTA]
  HAS -->|some| GRID[Rows + search/filter/sort controls + pager]
  GRID --> Q[Change search/filter/sort/page]
  Q --> REFETCH[React Query refetch with new key]
```

### 2.3 File details & delete

```mermaid
flowchart TD
  ROW[Click file] --> D[/files/:id/]
  D --> META[Show metadata + type + size + date]
  META --> EC{extractionStatus}
  EC -->|DONE| SHOW[Render extracted content / preview]
  EC -->|SKIPPED| IMG{image?}
  IMG -->|yes| PREV[Image preview via /download]
  IMG -->|no| NOTE[‘No extractable content’]
  EC -->|FAILED| WARN[‘Extraction failed’ note]
  D --> DEL[Delete -> confirm dialog]
  DEL --> CONF{confirm?}
  CONF -->|yes| RM[DELETE; invalidate; back to /files]
  CONF -->|no| STAY[Close dialog]
```

### 2.4 User dashboard

Load `/dashboard` → React Query `stats/user` → render 4 widgets (total files, storage, type distribution pie, upload-history line, Recharts). Loading → skeleton; error → retry; zero data → friendly empty charts.

### User failure/edge states

| Situation | Behaviour |
|---|---|
| Token expired mid-session | Next 401 → clear cache → redirect /login. |
| Access another user's file URL | 403 → 'Not found or no access' page. |
| Invalid pagination (page beyond range) | Return empty page + meta; UI shows 'no results'. |
| Invalid sort field | Backend ignores, uses default; UI resets control. |
| Empty search | Treated as no filter (all own files). |

## 3. Admin flows

### 3.1 Admin gate

```mermaid
flowchart TD
  NAV[Navigate /admin/*] --> FE{FE guard: role==ADMIN?}
  FE -->|no| RED[Redirect /dashboard + toast 'no access']
  FE -->|yes| PAGE[Render admin page]
  PAGE --> API[Admin API call]
  API --> BE{BE RBAC}
  BE -->|non-admin token| 403[403 ERR_FORBIDDEN]
  BE -->|admin| DATA[Return data]
```

FE guard is UX; BE RBAC is the real boundary (CON-05, `08`).

### 3.2 User management

```mermaid
flowchart TD
  UM[/admin/users/] --> L[List + search + pager]
  L --> ACT{action}
  ACT -->|change role| CR[Confirm -> PATCH -> invalidate]
  ACT -->|delete| CD[Confirm 'delete user + files' -> DELETE -> invalidate]
  CR --> SELF1{target==self demote?}
  SELF1 -->|yes| B1[Blocked 403 ERR_SELF_DEMOTE + toast]
  CD --> SELF2{target==self?}
  SELF2 -->|yes| B2[Blocked 403 ERR_SELF_DELETE + toast]
```

### 3.3 File management

`/admin/files` → list all files (`scope=all`) with owner column + search + category filter + pager → delete any file (confirm dialog) → invalidate admin files + admin stats.

### 3.4 Admin dashboard

`/admin` → `stats/admin` → total users, total files, storage, top types (bar/pie), recent uploads list. Same loading/empty/error handling.

### Admin failure/edge states

| Situation | Behaviour |
|---|---|
| Non-admin forges request | 403 regardless of FE. |
| Delete last admin (self) | Blocked (ADR-020). |
| Delete user with many files | Cascade; progress/toast on completion. |
| Stats with zero data | Empty charts + zeros. |
