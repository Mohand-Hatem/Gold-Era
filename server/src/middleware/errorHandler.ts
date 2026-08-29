import { Prisma } from "@prisma/client"
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
 *   3. Prisma known errors       → P2002 conflict, P2025 not found
 *   4. body-parser size limit    → 413 ERR_FILE_TOO_LARGE
 *   5. malformed JSON            → 400 ERR_VALIDATION
 *   6. anything else             → 500 ERR_INTERNAL (stack logged, never sent)
 *
 * Multer mappings (Phase 5) are added when that library enters the project.
 *
 * Security: the final case never leaks a stack trace, SQL, or secret to the
 * client — docs/20 §8, NFR-003.
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

  // 3 — Prisma failures that map to a meaningful client response
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint. Acts as a backstop for the race where two concurrent
    // registrations both pass the "email exists?" check.
    if (err.code === "P2002") {
      const target = err.meta?.target
      const isEmail = Array.isArray(target)
        ? target.includes("email")
        : String(target ?? "").includes("email")

      if (isEmail) {
        fail(res, "ERR_EMAIL_TAKEN", "An account with this email already exists", 409)
        return
      }

      fail(res, "ERR_VALIDATION", "That value is already in use", 409)
      return
    }

    // Record required by the operation does not exist.
    if (err.code === "P2025") {
      fail(res, "ERR_NOT_FOUND", "Resource not found", 404)
      return
    }
  }

  if (err instanceof Error) {
    const parserError = err as BodyParserError

    // 4 — payload exceeded the configured JSON/urlencoded limit
    if (parserError.type === "entity.too.large") {
      fail(res, "ERR_FILE_TOO_LARGE", "Request body is too large", 413)
      return
    }

    // 5 — client sent syntactically invalid JSON
    if (parserError.type === "entity.parse.failed" || err instanceof SyntaxError) {
      fail(res, "ERR_VALIDATION", "Request body is not valid JSON", 400)
      return
    }
  }

  // 6 — unexpected: log everything, disclose nothing
  console.error(`[error] ${req.method} ${req.originalUrl} — unhandled exception`)
  console.error(err)

  const message = isProduction
    ? "Something went wrong"
    : err instanceof Error
      ? err.message
      : "Something went wrong"

  fail(res, "ERR_INTERNAL", message, 500)
}
