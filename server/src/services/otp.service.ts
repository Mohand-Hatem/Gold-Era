import { randomInt } from "node:crypto"

import bcrypt from "bcrypt"

import {
  BCRYPT_COST,
  OTP_LENGTH,
  OTP_MAX_RESENDS_PER_HOUR,
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
} from "../config/constants.js"

/**
 * One-time verification code policy (BE-012, ADR-010).
 *
 * Deliberately free of Prisma: this module owns the *policy* (format, expiry,
 * attempt caps, resend windows) while persistence lives in the auth repository.
 * That keeps the whole policy unit-testable without a database (docs/23).
 *
 * Codes are hashed at rest — plaintext exists only in the outbound email.
 */

/**
 * Generates a zero-padded numeric code.
 *
 * Uses `crypto.randomInt`, not `Math.random`: this is a security token and a
 * predictable generator would let an attacker skip the attempt cap entirely.
 */
export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH
  return randomInt(0, max).toString().padStart(OTP_LENGTH, "0")
}

/** Hashes a code for storage. */
export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_COST)
}

/** Verifies a submitted code against a stored hash. */
export async function verifyOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

/** Expiry timestamp for a code issued now. */
export function otpExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + OTP_TTL_MS)
}

/** True when the code's expiry has passed. */
export function isOtpExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime()
}

/** True while the code still has verification attempts left (cap: 5). */
export function hasAttemptsRemaining(attempts: number): boolean {
  return attempts < OTP_MAX_VERIFY_ATTEMPTS
}

/**
 * Milliseconds remaining before another code may be requested.
 * Returns 0 when a resend is allowed.
 */
export function resendCooldownRemainingMs(
  newestCodeCreatedAt: Date | null,
  now: Date = new Date(),
): number {
  if (!newestCodeCreatedAt) return 0

  const elapsed = now.getTime() - newestCodeCreatedAt.getTime()
  const remaining = OTP_RESEND_COOLDOWN_MS - elapsed
  return remaining > 0 ? remaining : 0
}

/** True when the hourly resend cap has been reached. */
export function hasReachedResendLimit(codesInLastHour: number): boolean {
  return codesInLastHour >= OTP_MAX_RESENDS_PER_HOUR
}

/** Start of the rolling window used to count recent resends. */
export function resendWindowStart(now: Date = new Date()): Date {
  return new Date(now.getTime() - 60 * 60 * 1000)
}
