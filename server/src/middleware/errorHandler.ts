import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"

import { isProduction } from "../config/env"
import { AppError, type ErrorDetail } from "../utils/AppError"
import { fail } from "../utils/response"

/**
 * Central error handler (BE-004).
 *
 * Maps every failure to the error envelope defined in docs/19. The mapping
 * ladder is deliberate and ordered:
 *
 *   1. AppError                  → its own code / status / message
 *   2. ZodError                  → 400 ERR_VALIDATION with field details
 *   3. body-parser size limit    → 413 ERR_FILE_TOO_LARGE
 *   4. malformed JSON            → 400 ERR_VALIDATION
 *   5. anything else             → 500 ERR_INTERNAL (stack logged, never sent)
 *
 * Prisma (Phase 3) and Multer (Phase 5) mappings are added when those libraries
 * enter the project.
 *
 * Security: case 5 never leaks a stack trace, SQL, or secret to the client —
 * docs/20 §8, NFR-003.
 */

interface BodyParserError extends Error {
  type?: string
  status?: number
  statusCode?: number
}

function zodIssuesToDetails(error: ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }))
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // Express identifies an error handler by its four-argument signature, so
  // `next` must stay even though it is unused.
  _next: NextFunction,
): void {
  // 1 — expected, typed application failures
  if (err instanceof AppError) {
    fail(res, err.code, err.message, err.status, err.details)
    return
  }

  // 2 — schema validation that reached here without being wrapped
  if (err instanceof ZodError) {
    fail(res, "ERR_VALIDATION", "Validation failed", 400, zodIssuesToDetails(err))
    return
  }

  if (err instanceof Error) {
    const parserError = err as BodyParserError

    // 3 — payload exceeded the configured JSON/urlencoded limit
    if (parserError.type === "entity.too.large") {
      fail(res, "ERR_FILE_TOO_LARGE", "Request body is too large", 413)
      return
    }

    // 4 — client sent syntactically invalid JSON
    if (parserError.type === "entity.parse.failed" || err instanceof SyntaxError) {
      fail(res, "ERR_VALIDATION", "Request body is not valid JSON", 400)
      return
    }
  }

  // 5 — unexpected: log everything, disclose nothing
  console.error(`[error] ${req.method} ${req.originalUrl} — unhandled exception`)
  console.error(err)

  const message = isProduction
    ? "Something went wrong"
    : err instanceof Error
      ? err.message
      : "Something went wrong"

  fail(res, "ERR_INTERNAL", message, 500)
}
