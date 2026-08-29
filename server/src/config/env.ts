import { z } from "zod"

/**
 * Typed, validated environment configuration (BE-001).
 *
 * Validation happens once at import time. If a required variable is missing or
 * malformed the process exits immediately rather than starting in a broken
 * state — see docs/06 NFR-011 and docs/25 §3.
 *
 * Every variable and its purpose is documented in docs/25-Environment-Variables.md.
 */
const envSchema = z.object({
  // ── Server ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  // ── Database (consumed from Phase 3) ────────────────────────────────────
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ── Auth / JWT (consumed from Phase 4) ──────────────────────────────────
  // 32-char minimum: docs/25 recommends >=32 bytes; enforcing it at boot turns
  // that recommendation into a guarantee.
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // ── Seeded admin (consumed from Phase 3) ────────────────────────────────
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_NAME: z.string().min(1).default("Admin"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin123"),

  // ── Email / OTP delivery (consumed from Phase 4) ────────────────────────
  // Optional: when absent, MailService logs OTPs to the console (ADR-011).
  GMAIL_USER: z.string().optional(),
  GMAIL_PASS: z.string().optional(),

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
  UPLOAD_DIR: z.string().min(1).default("uploads"),

  // ── OTP policy (ADR-010, consumed from Phase 4) ─────────────────────────
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),

  // ── Rate limiting (P1, consumed from Phase 4) ───────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("\n[config] Invalid environment configuration:\n")
    for (const issue of parsed.error.issues) {
      const variable = issue.path.join(".") || "(root)"
      console.error(`  - ${variable}: ${issue.message}`)
    }
    console.error("\nSee server/.env.example and docs/25-Environment-Variables.md\n")
    process.exit(1)
  }

  return Object.freeze(parsed.data)
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === "production"
export const isDevelopment = env.NODE_ENV === "development"
export const isTest = env.NODE_ENV === "test"
