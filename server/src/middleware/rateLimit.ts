import rateLimit from "express-rate-limit"

import { AUTH_RATE_LIMIT_MAX } from "../config/constants"
import { env, isTest } from "../config/env"
import { AppError } from "../utils/AppError"

/**
 * Rate limiting (BE-017, P1, SYS-004, docs/20 §9).
 *
 * In-memory store: sufficient for a single dyno and avoids adding Redis for one
 * feature. If the API were scaled to multiple instances this would need a shared
 * store to be effective.
 *
 * Errors route through AppError so the response uses the standard envelope
 * rather than the library's plain-text default (docs/19).
 */
export const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Disabled under test so a suite of auth cases cannot trip the limiter and
  // produce confusing cascading failures (Phase 12).
  skip: () => isTest,
  handler: (_req, _res, next) => {
    next(
      AppError.tooManyRequests(
        "ERR_RATE_LIMITED",
        "Too many attempts. Please try again later.",
      ),
    )
  },
})
