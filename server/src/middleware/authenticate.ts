import type { NextFunction, Request, Response } from "express"

import { prisma } from "../config/prisma.js"
import { extractToken, verifyAuthToken } from "../services/token.service.js"
import { AppError } from "../utils/AppError.js"

/**
 * Session verification (BE-014, AUTH-009).
 *
 * The security boundary for every protected route. Frontend guards are UX only
 * (CON-05) — this middleware must pass regardless of what the client believes.
 *
 * Every failure returns the same 401 `ERR_UNAUTHENTICATED` so a caller cannot
 * distinguish "no token" from "expired" from "user deleted" (docs/20 §8).
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req)

  if (!token) {
    next(AppError.unauthenticated())
    return
  }

  const payload = verifyAuthToken(token)

  if (!payload) {
    next(AppError.unauthenticated())
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, tokenVersion: true },
  })

  // Token is cryptographically valid but the account is gone.
  if (!user) {
    next(AppError.unauthenticated())
    return
  }

  // Invalidates tokens issued before a role change or forced logout (AUTH-013).
  if (user.tokenVersion !== payload.tokenVersion) {
    next(AppError.unauthenticated("Session expired, please log in again"))
    return
  }

  req.user = user
  next()
}
