import type { Request, Response } from "express"

import { clearAuthCookie, setAuthCookie } from "../../services/token.service.js"
import { uploadBlob } from "../../services/storage.service.js"
import { extractExtension } from "../../utils/sanitizeFilename.js"
import { AppError } from "../../utils/AppError.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ok } from "../../utils/response.js"
import * as service from "./auth.service.js"
import type { LoginInput, RegisterInput, ResendCodeInput, VerifyEmailInput } from "./auth.schemas.js"

/**
 * Auth HTTP layer (docs/15).
 */

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.register(req.body as RegisterInput)

  ok(
    res,
    {
      userId: result.userId,
      email: result.email,
      message: "Verification code sent",
    },
    201,
  )
})

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { alreadyVerified } = await service.verifyEmail(req.body as VerifyEmailInput)

  ok(res, {
    message: alreadyVerified
      ? "Email is already verified. You can log in."
      : "Email verified. You can now log in.",
  })
})

export const resendCode = asyncHandler(async (req: Request, res: Response) => {
  await service.resendCode(req.body as ResendCodeInput)

  ok(res, { message: "Verification code sent" })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await service.login(req.body as LoginInput)

  setAuthCookie(res, token)
  ok(res, { user })
})

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res)
  ok(res, { message: "Logged out" })
})

export const profile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthenticated()
  }

  const user = await service.getProfile(req.user.id)
  ok(res, user)
})

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthenticated()
  }

  if (!req.file) {
    throw AppError.badRequest("ERR_NO_FILE", "No image file uploaded for avatar")
  }

  if (!req.file.mimetype.startsWith("image/")) {
    throw AppError.badRequest("ERR_INVALID_MIME", "Avatar must be an image format (JPEG, PNG, WebP)")
  }

  const ext = extractExtension(req.file.originalname) || "png"
  const stored = await uploadBlob(req.file.buffer, ext, req.file.mimetype)

  const updatedUser = await service.updateAvatar(req.user.id, stored.secureUrl)
  ok(res, updatedUser)
})
