import { Router } from "express"
import multer from "multer"

import { authenticate } from "../../middleware/authenticate.js"
import { authRateLimit } from "../../middleware/rateLimit.js"
import { validate } from "../../middleware/validate.js"
import * as controller from "./auth.controller.js"
import {
  loginSchema,
  registerSchema,
  resendCodeSchema,
  verifyEmailSchema,
} from "./auth.schemas.js"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

/**
 * Auth routes — mounted at `${API_PREFIX}/auth` (docs/11 §3).
 */
export const authRoutes = Router()

authRoutes.post(
  "/register",
  authRateLimit,
  validate({ body: registerSchema }),
  controller.register,
)

authRoutes.post(
  ["/verify-email", "/verify-otp"],
  authRateLimit,
  validate({ body: verifyEmailSchema }),
  controller.verifyEmail,
)

authRoutes.post(
  ["/resend-code", "/resend-otp"],
  authRateLimit,
  validate({ body: resendCodeSchema }),
  controller.resendCode,
)

authRoutes.post("/login", authRateLimit, validate({ body: loginSchema }), controller.login)

// Public and idempotent
authRoutes.post("/logout", controller.logout)

authRoutes.get(["/profile", "/me"], authenticate, controller.profile)

// Avatar photo upload for user profile
authRoutes.post("/avatar", authenticate, upload.single("avatar"), controller.uploadAvatar)

export default authRoutes
