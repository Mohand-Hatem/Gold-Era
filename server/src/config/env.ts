import { z } from "zod"

/**
 * Typed, validated environment configuration (BE-001).
 *
 * Validation happens once at import time. If a required variable is missing or
 * malformed, the process exits immediately rather than starting in a broken
 * state — see docs/06 NFR-011 and docs/25 §3. On Vercel it throws instead of
 * exiting, since `process.exit` in a serverless function kills the invocation
 * without a clean error surface; Vercel reports the thrown error normally.
 *
 * Every variable and its purpose is documented in docs/25-Environment-Variables.md.
 */
const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  // ── Database (consumed from Phase 3) ────────────────────────────────────
  /** Pooled connection used by the application at runtime. */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /**
   * Unpooled connection used by `prisma migrate` (ADR-032). Migrations rely on
   * advisory locks and long transactions that transaction-mode pooling breaks.
   * Falls back to DATABASE_URL when the provider has no separate direct host.
   */
  DIRECT_URL: z.string().min(1).optional(),

  // ── Auth / JWT (consumed from Phase 4) ──────────────────────────────────
  // 32-char minimum: docs/25 recommends >=32 bytes; enforcing it at boot turns
  // that recommendation into a guarantee.
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // ── Seeded admin (consumed from Phase 3) ────────────────────────────────
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_NAME: z.string().min(1).default("Admin"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin123"),

  // ── Email / OTP delivery (consumed from Phase 4, ADR-011) ───────────────
  // Nodemailer + Gmail SMTP is the only delivery mechanism. Credentials are a
  // Gmail *App Password* (2FA required) — never the account password.
  //
  // Optional in the schema so development and tests boot without mail, but
  // required in production: see the refinement below.
  SMTP_HOST: z.string().min(1).default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  /** Envelope From. Defaults to `"Filox" <SMTP_USER>` when unset. */
  SMTP_FROM: z.string().optional(),

  // ── Blob storage: Cloudinary (ADR-039) ──────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  /** Folder prefix for uploaded assets, so the account stays tidy. */
  CLOUDINARY_FOLDER: z.string().min(1).default("filox"),

  // ── CORS + cookie behaviour (ADR-008) ───────────────────────────────────
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),

  // ── Upload limits (ADR-002, consumed from Phase 5) ──────────────────────
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  MAX_FILES_PER_UPLOAD: z.coerce.number().int().positive().default(5),

  // ── OTP policy (ADR-010, consumed from Phase 4) ─────────────────────────
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),

  // ── Rate limiting (P1, consumed from Phase 4) ───────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
})

/**
 * Production requires working mail credentials.
 *
 * Verification email is the only way an account can be activated, so a
 * production deploy without SMTP credentials is broken — better to refuse to
 * start than to fail at the first registration.
 */
const configSchema = envSchema.superRefine((config, ctx) => {
  if (config.NODE_ENV !== "production") return

  for (const key of ["SMTP_USER", "SMTP_PASSWORD"] as const) {
    if (!config[key]) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: `${key} is required in production (Gmail App Password authentication)`,
      })
    }
  }
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = configSchema.safeParse(process.env)

  if (!parsed.success) {
    const lines = [
      "",
      "[config] Invalid environment configuration:",
      "",
      ...parsed.error.issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`),
      "",
      "See server/.env.example and docs/25-Environment-Variables.md",
      "",
    ]
    console.error(lines.join("\n"))

    // On Vercel, `process.exit` kills the function invocation with no useful
    // surface for the caller (no response, no clean log line). Throwing lets
    // the platform report it as a normal invocation failure. Locally and on
    // any long-running host, exiting immediately is still preferable: it
    // fails the deploy loudly instead of accepting traffic in a broken state.
    if (process.env.VERCEL) {
      throw new Error("Invalid environment configuration — see logs above")
    }

    process.exit(1)
  }

  return Object.freeze(parsed.data)
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === "production"
export const isDevelopment = env.NODE_ENV === "development"
export const isTest = env.NODE_ENV === "test"
