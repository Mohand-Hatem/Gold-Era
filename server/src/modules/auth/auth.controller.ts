import type { Request, Response } from "express"

import { clearAuthCookie, setAuthCookie } from "../../services/token.service"
import { AppError } from "../../utils/AppError"
import { asyncHandler } from "../../utils/asyncHandler"
import { ok } from "../../utils/response"
import * as service from "./auth.service"
import type { LoginInput, RegisterInput, ResendCodeInput, VerifyEmailInput } from "./auth.schemas"

/**
 * Auth HTTP layer (docs/15).
 *
 * Shapes requests and responses only — every decision lives in auth.service.
 * Bodies are already validated and coerced by `validate` middleware.
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

/**
 * Public and idempotent by design.
 *
 * docs/11 lists this as authenticated, but requiring a valid token creates a
 * dead end: once the token expires the cookie can never be cleared and the
 * browser keeps sending it. Clearing a cookie the caller already holds grants no
 * capability, so this always succeeds (ADR-036).
 */
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
