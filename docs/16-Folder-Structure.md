# 16 — Folder Structure

Repository root uses `client/` + `server/` + `docs/` (matches existing repo and README). Every major folder has one responsibility.

## Repository root

```
Managing-Your-Files/            (repo: Gold-Era)
├── client/                     # Next.js frontend
├── server/                     # Express backend
├── docs/                       # this documentation package
└── README.md                   # root project readme (spec in 34)
```

## Backend — `server/`

```
server/
├── prisma/
│   ├── schema.prisma           # models User, VerificationCode, File; enums
│   ├── migrations/             # generated migrations
│   └── seed.ts                 # idempotent admin seed (ADR-019)
├── src/
│   ├── config/
│   │   ├── env.ts              # typed, validated env (25)
│   │   ├── prisma.ts           # PrismaClient singleton
│   │   ├── cors.ts             # credentialed CORS allow-list
│   │   ├── cloudinary.ts       # Cloudinary SDK config (ADR-039)
│   │   └── constants.ts        # limits, allowed types, OTP/JWT settings
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorizeRole.ts
│   │   ├── validate.ts         # zod
│   │   ├── upload.ts           # multer
│   │   ├── rateLimit.ts        # P1
│   │   ├── requestLogger.ts    # P1
│   │   ├── notFound.ts
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.schemas.ts
│   │   ├── users/  (routes/controller/service/repository/schemas)
│   │   ├── files/  (routes/controller/service/repository/schemas)
│   │   └── stats/  (routes/controller/service)
│   ├── services/
│   │   ├── token.service.ts
│   │   ├── password.service.ts
│   │   ├── otp.service.ts
│   │   ├── mail.service.ts
│   │   ├── storage.service.ts
│   │   └── extraction.service.ts
│   ├── utils/
│   │   ├── AppError.ts          # typed error
│   │   ├── asyncHandler.ts
│   │   ├── response.ts          # envelope helpers
│   │   ├── sanitizeFilename.ts
│   │   └── categorize.ts        # mime -> FileCategory
│   ├── types/
│   │   └── express.d.ts         # req.user augmentation
│   ├── app.ts
│   └── server.ts
├── tests/                       # vitest + supertest (23)
│   ├── auth.test.ts
│   ├── files.test.ts
│   ├── users.test.ts
│   └── helpers/
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

| Folder | Responsibility |
|---|---|
| `prisma/` | schema, migrations, seed. |
| `config/` | environment, DB client, CORS, constants. |
| `middleware/` | cross-cutting request handling. |
| `modules/*` | vertical feature slices (route→controller→service→repository→schemas). |
| `services/` | reusable external/domain services. |
| `utils/` | pure helpers, error type, response envelope. |
| `types/` | ambient TypeScript augmentations. |
| `tests/` | automated tests. |

## Frontend — `client/`

```
client/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx           # auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── files/page.tsx
│   │   ├── files/[id]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── (admin)/
│   │       ├── layout.tsx       # ADMIN guard
│   │       ├── admin/page.tsx
│   │       ├── admin/users/page.tsx
│   │       └── admin/files/page.tsx
│   ├── layout.tsx               # root providers, toaster
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   └── ui/                      # Button, Input, Table, Dialog, Toast, Skeleton, EmptyState, Pagination, ProgressBar...
├── features/
│   ├── auth/
│   ├── files/
│   ├── dashboard/
│   └── admin/
├── hooks/                       # useAuth, useFiles, useUploadFiles, useUsers, useDebounce, usePagination...
├── lib/
│   ├── axios.ts                 # instance: withCredentials, X-Requested-With, 401 handler
│   └── queryClient.ts
├── services/                    # auth/files/users/stats service wrappers
├── providers/                   # QueryProvider, ThemeProvider, ToastProvider, AuthProvider
├── types/                       # shared DTO/response types
├── utils/                       # formatBytes, formatDate, fileCategory, cn
├── public/
├── .env.local.example
├── next.config.ts
├── postcss.config.mjs           # @tailwindcss/postcss (Tailwind 4)
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```

> **Tailwind 4 note.** The project uses `tailwindcss@4.3.3`, which is CSS-first: there is **no `tailwind.config.ts`**. Design tokens (colors, fonts, spacing from `docs/design/DESIGN.md`) are declared with `@theme` inside `app/globals.css`, and Tailwind is wired in through `postcss.config.mjs`. Scaffolded in Phase 1; tokens applied in Phase 7.
>
> `create-next-app` also generates `client/AGENTS.md` and `client/CLAUDE.md` (agent instruction files). Next.js rewrites `AGENTS.md` on every `next dev`, so they are kept rather than deleted.

| Folder | Responsibility |
|---|---|
| `app/` | routes, layouts, guards (route groups). |
| `components/ui/` | reusable presentational primitives. |
| `features/*` | feature-scoped composite components. |
| `hooks/` | reusable React Query + UI hooks. |
| `lib/` | Axios + QueryClient setup. |
| `services/` | typed API call wrappers. |
| `providers/` | app-wide context providers. |
| `types/` | shared TypeScript types mirroring API DTOs. |
| `utils/` | pure formatting/helper functions. |
| `app/globals.css` | Tailwind entry + `@theme` design tokens (Tailwind 4, no config file). |

## Conventions

- Files: `kebab-case` (backend) / `PascalCase` for React components.
- One module = one folder; no cross-module repository imports.
- Shared response/DTO types mirror `11` envelope shapes.
- `.env*` and `uploads/` git-ignored; `.env.example` committed.
