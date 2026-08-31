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

// Avatars stay multipart-through-the-function (unlike the files module, see
// files.schemas.ts): a profile picture doesn't justify the direct-upload
// machinery. 4 MB keeps every request under Vercel's 4.5 MB function body
// cap with headroom for the rest of the multipart envelope.
const AVATAR_MAX_SIZE_BYTES = 4 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
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
