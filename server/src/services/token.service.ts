import type { Role } from "@prisma/client"
import type { CookieOptions, Request, Response } from "express"
import jwt from "jsonwebtoken"

import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME } from "../config/constants"
import { env } from "../config/env"

/**
 * JWT issuing/verification and auth-cookie handling (BE-011, ADR-007, ADR-008).
 *
 * The token travels in an httpOnly cookie so client-side script cannot read it,
 * which removes XSS token theft as a class of attack. Cookie flags are driven by
 * environment so local development works over http (`SameSite=Lax`) while
 * production works cross-site between Vercel and the API host
 * (`SameSite=None; Secure`).
 *
 * Cookie attributes live here and nowhere else — set and clear must agree
 * exactly or the browser will refuse to remove the cookie.
 */

export interface AuthTokenPayload {
  /** User id (JWT standard subject claim). */
  sub: string
  role: Role
  /** Compared against the database to invalidate tokens on role change or delete. */
  tokenVersion: number
}

/** Signs a 7-day HS256 access token. */
export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  })
}

/**
 * Verifies a token.
 *
 * Returns `null` for any failure — expired, malformed, wrong signature, or
 * unexpected shape. An invalid token is an expected condition on a public
 * internet, not an exception, so callers get a value to branch on rather than a
 * throw to catch.
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.sub !== "string" ||
      typeof (decoded as Record<string, unknown>).role !== "string" ||
      typeof (decoded as Record<string, unknown>).tokenVersion !== "number"
    ) {
      return null
    }

    const claims = decoded as unknown as AuthTokenPayload
    return { sub: claims.sub, role: claims.role, tokenVersion: claims.tokenVersion }
  } catch {
    return null
  }
}

/** Cookie attributes for the auth cookie. Must be identical for set and clear. */
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  }
}

/** Attaches the auth cookie to a response. */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions())
}

/** Removes the auth cookie (logout). */
export function clearAuthCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = authCookieOptions()
  res.clearCookie(AUTH_COOKIE_NAME, options)
}

/**
 * Reads the token from the request.
 *
 * The cookie is the real transport. The `Authorization: Bearer` fallback is
 * documented in docs/11 §1 and exists so API tests (Phase 12, Supertest) can
 * authenticate without a cookie jar.
 */
export function extractToken(req: Request): string | null {
  const fromCookie = (req.cookies as Record<string, string | undefined> | undefined)?.[
    AUTH_COOKIE_NAME
  ]
  if (fromCookie) return fromCookie

  const header = req.headers.authorization
  if (header?.startsWith("Bearer ")) {
    const value = header.slice("Bearer ".length).trim()
    if (value) return value
  }

  return null
}
