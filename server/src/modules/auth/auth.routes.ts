import { Router } from "express"

import { authenticate } from "../../middleware/authenticate"
import { authRateLimit } from "../../middleware/rateLimit"
import { validate } from "../../middleware/validate"
import * as controller from "./auth.controller"
import {
  loginSchema,
  registerSchema,
  resendCodeSchema,
  verifyEmailSchema,
} from "./auth.schemas"

/**
 * Auth routes — mounted at `${API_PREFIX}/auth` (docs/11 §3).
 *
 * Rate limiting guards the routes an attacker can hammer without credentials.
 * `profile` is excluded: it already requires a valid token, and limiting it
 * would throttle legitimate authenticated browsing.
 */
export const authRoutes = Router()

authRoutes.post(
  "/register",
  authRateLimit,
  validate({ body: registerSchema }),
  controller.register,
)

authRoutes.post(
  "/verify-email",
  authRateLimit,
  validate({ body: verifyEmailSchema }),
  controller.verifyEmail,
)

authRoutes.post(
  "/resend-code",
  authRateLimit,
  validate({ body: resendCodeSchema }),
  controller.resendCode,
)

authRoutes.post("/login", authRateLimit, validate({ body: loginSchema }), controller.login)

// Public and idempotent — see auth.controller.logout for the rationale.
authRoutes.post("/logout", controller.logout)

authRoutes.get("/profile", authenticate, controller.profile)

export default authRoutes
