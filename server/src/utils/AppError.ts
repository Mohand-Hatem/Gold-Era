/**
 * Typed application error (BE-003).
 *
 * Services throw `AppError`; the central error handler (middleware/errorHandler)
 * maps it to the response envelope. The `ErrorCode` union is the exact catalogue
 * from docs/19 §2, so an undocumented code is a compile error.
 */

export type ErrorCode =
  // Validation
  | "ERR_VALIDATION"
  // Authentication
  | "ERR_UNAUTHENTICATED"
  | "ERR_INVALID_CREDENTIALS"
  | "ERR_EMAIL_NOT_VERIFIED"
  // Authorization
  | "ERR_FORBIDDEN"
  | "ERR_SELF_DELETE"
  | "ERR_SELF_DEMOTE"
  // Not found
  | "ERR_USER_NOT_FOUND"
  | "ERR_FILE_NOT_FOUND"
  | "ERR_NOT_FOUND"
  // Conflict
  | "ERR_EMAIL_TAKEN"
  | "ERR_ALREADY_VERIFIED"
  // OTP
  | "ERR_OTP_INVALID"
  | "ERR_OTP_EXPIRED"
  | "ERR_OTP_ATTEMPTS"
  | "ERR_OTP_COOLDOWN"
  | "ERR_OTP_RESEND_LIMIT"
  // Upload
  | "ERR_FILE_TOO_LARGE"
  | "ERR_UNSUPPORTED_TYPE"
  | "ERR_UPLOAD_FAILED"
  // Infrastructure
  | "ERR_RATE_LIMITED"
  | "ERR_EMAIL_SEND_FAILED"
  | "ERR_INTERNAL"

export interface ErrorDetail {
  field: string
  message: string
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: ErrorDetail[]
  /** Distinguishes expected failures from programmer errors / crashes. */
  readonly isOperational = true

  constructor(code: ErrorCode, status: number, message: string, details?: ErrorDetail[]) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
    this.details = details
    Error.captureStackTrace?.(this, AppError)
  }

  // ── Factories ─────────────────────────────────────────────────────────────
  // Keep status codes in one place so call sites read intent, not numbers.

  static validation(details: ErrorDetail[], message = "Validation failed"): AppError {
    return new AppError("ERR_VALIDATION", 400, message, details)
  }

  static badRequest(code: ErrorCode, message: string): AppError {
    return new AppError(code, 400, message)
  }

  static unauthenticated(message = "Authentication required"): AppError {
    return new AppError("ERR_UNAUTHENTICATED", 401, message)
  }

  static invalidCredentials(message = "Invalid email or password"): AppError {
    return new AppError("ERR_INVALID_CREDENTIALS", 401, message)
  }

  static forbidden(
    message = "You do not have permission to perform this action",
    code: ErrorCode = "ERR_FORBIDDEN",
  ): AppError {
    return new AppError(code, 403, message)
  }

  static notFound(code: ErrorCode = "ERR_NOT_FOUND", message = "Resource not found"): AppError {
    return new AppError(code, 404, message)
  }

  static conflict(code: ErrorCode, message: string): AppError {
    return new AppError(code, 409, message)
  }

  static payloadTooLarge(message = "Payload too large"): AppError {
    return new AppError("ERR_FILE_TOO_LARGE", 413, message)
  }

  static unsupportedType(message = "Unsupported file type"): AppError {
    return new AppError("ERR_UNSUPPORTED_TYPE", 415, message)
  }

  static tooManyRequests(code: ErrorCode, message: string): AppError {
    return new AppError(code, 429, message)
  }

  static internal(message = "Something went wrong"): AppError {
    return new AppError("ERR_INTERNAL", 500, message)
  }

  /** A dependency the request needed (mail, storage) was unreachable. */
  static serviceUnavailable(code: ErrorCode, message: string): AppError {
    return new AppError(code, 503, message)
  }
}
