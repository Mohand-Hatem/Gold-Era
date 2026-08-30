import { env } from "./env.js"

/**
 * Application constants (BE-001).
 *
 * Values that are policy decisions rather than deployment configuration live
 * here so there is one place to look. Anything a deployer might need to change
 * is sourced from `env` instead. Sources are noted per block.
 */

// ── API surface (ADR-027) ───────────────────────────────────────────────────
export const API_PREFIX = "/api"

// ── Upload limits (ADR-002) ─────────────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_FILES_PER_UPLOAD = env.MAX_FILES_PER_UPLOAD
export const MAX_UPLOAD_REQUEST_BYTES = 50 * 1024 * 1024

/** Empty files are rejected — nothing to store, nothing to extract (ADR-042). */
export const MIN_FILE_SIZE_BYTES = 1

/**
 * Cloudinary's free tier caps a single asset at 10 MiB, which is exactly our
 * per-file limit. A file at precisely the boundary passes our validation and is
 * then refused by the provider, so that failure is mapped rather than surfaced
 * as an unhandled error.
 */
export const PROVIDER_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** JSON body limit. Multipart uploads bypass this and use Multer limits. */
export const JSON_BODY_LIMIT = "100kb"

// ── Allowed file types (ADR-003) ────────────────────────────────────────────
export const ALLOWED_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "json",
  "pdf",
  "docx",
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const

export const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

/**
 * Extension → MIME types accepted for it.
 *
 * Used to confirm that the extension, the client's declared MIME type, and the
 * type detected from the actual bytes all agree. Disagreement means either a
 * confused client or a spoofing attempt; both are rejected (docs/20 §5).
 *
 * Plain-text formats have no magic bytes, so they are validated by extension,
 * declared type, and a UTF-8 decode check instead.
 */
export const EXTENSION_MIME_MAP: Record<string, readonly string[]> = {
  txt: ["text/plain"],
  md: ["text/markdown", "text/plain", "text/x-markdown"],
  csv: ["text/csv", "text/plain", "application/csv"],
  json: ["application/json", "text/plain"],
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
}

/** Extensions with no reliable magic-byte signature. */
export const MAGIC_BYTE_EXEMPT_EXTENSIONS = ["txt", "md", "csv", "json"] as const

/** Extracted text is truncated to this many characters (ADR-005). */
export const MAX_EXTRACTED_CONTENT_CHARS = 20_000

/** Longest accepted original filename (ADR-016). */
export const MAX_ORIGINAL_NAME_LENGTH = 255

// ── OTP policy (ADR-010) ────────────────────────────────────────────────────
export const OTP_LENGTH = 6
export const OTP_TTL_MS = env.OTP_TTL_MINUTES * 60 * 1000
export const OTP_MAX_VERIFY_ATTEMPTS = 5
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000
export const OTP_MAX_RESENDS_PER_HOUR = 5

// ── Auth (ADR-007, ADR-018) ─────────────────────────────────────────────────
export const BCRYPT_COST = 12
export const AUTH_COOKIE_NAME = "access_token"
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Requests per IP per rate-limit window on auth routes.
 *
 * Deliberately tighter than env.RATE_LIMIT_MAX (a general-purpose default):
 * 100 login attempts per 15 minutes is not a meaningful brake on credential
 * stuffing, whereas 20 is, while still leaving room for a user who mistypes a
 * password several times and then requests a couple of verification codes.
 */
export const AUTH_RATE_LIMIT_MAX = 20

// ── Pagination (ADR-012) ────────────────────────────────────────────────────
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// ── Statistics (docs/21) ────────────────────────────────────────────────────
export const UPLOAD_HISTORY_WINDOW_DAYS = 30
export const ADMIN_RECENT_UPLOADS_LIMIT = 10
