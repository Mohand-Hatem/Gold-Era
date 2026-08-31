import { OTP_MAX_VERIFY_ATTEMPTS } from "../../config/constants.js"
import { sendOtpEmail } from "../../services/mail.service.js"
import {
  generateOtpCode,
  hasAttemptsRemaining,
  hasReachedResendLimit,
  hashOtpCode,
  isOtpExpired,
  otpExpiryDate,
  resendCooldownRemainingMs,
  resendWindowStart,
  verifyOtpCode,
} from "../../services/otp.service.js"
import { comparePassword, compareDummy, hashPassword } from "../../services/password.service.js"
import { signAuthToken } from "../../services/token.service.js"
import { AppError } from "../../utils/AppError.js"
import * as repo from "./auth.repository.js"
import type { PublicUser } from "./auth.repository.js"
import type { LoginInput, RegisterInput, ResendCodeInput, VerifyEmailInput } from "./auth.schemas.js"

/**
 * Auth business logic (docs/12).
 */

/**
 * Delivers a code, converting any transport failure into a client-safe error.
 *
 * The send is awaited rather than dispatched in the background: an unsent code
 * leaves the account unusable, so the caller must learn about it. The code
 * itself never reaches the response or the logs.
 */
async function deliverCode(email: string, code: string): Promise<void> {
  try {
    await sendOtpEmail(email, code)
  } catch {
    // sendOtpEmail has already logged the reason without the code.
    throw AppError.serviceUnavailable(
      "ERR_EMAIL_SEND_FAILED",
      "Unable to send verification email. Please try again.",
    )
  }
}

/** Issues a fresh code for a user and emails it. Assumes eligibility is checked. */
async function issueVerificationCode(userId: string, email: string): Promise<void> {
  const code = generateOtpCode()
  const codeHash = await hashOtpCode(code)

  await repo.consumeAllActiveCodes(userId)
  await repo.createCode({ userId, codeHash, expiresAt: otpExpiryDate() })

  await deliverCode(email, code)
}

/** AUTH-001 / AUTH-002 — create an unverified account and send its first code. */
export async function register(
  input: RegisterInput,
): Promise<{ userId: string; email: string }> {
  const existing = await repo.findUserByEmail(input.email)
  if (existing) {
    throw AppError.conflict("ERR_EMAIL_TAKEN", "An account with this email already exists")
  }

  const passwordHash = await hashPassword(input.password)
  const code = generateOtpCode()
  const codeHash = await hashOtpCode(code)

  const user = await repo.createUserWithCode({
    name: input.name,
    email: input.email,
    passwordHash,
    codeHash,
    expiresAt: otpExpiryDate(),
  })

  // The account exists at this point. If delivery fails the caller gets a 503
  // and can request a replacement code once the resend cooldown elapses.
  await deliverCode(user.email, code)

  return { userId: user.id, email: user.email }
}

/** AUTH-003 / AUTH-012 — verify an emailed code and activate the account. */
export async function verifyEmail(input: VerifyEmailInput): Promise<{ alreadyVerified: boolean }> {
  const user = await repo.findUserByEmail(input.email)
  if (!user) {
    throw AppError.notFound("ERR_USER_NOT_FOUND", "No account found for this email")
  }

  if (user.isEmailVerified) {
    return { alreadyVerified: true }
  }

  const record = await repo.findNewestActiveCode(user.id)
  if (!record) {
    throw AppError.badRequest("ERR_OTP_EXPIRED", "No active verification code. Request a new one.")
  }

  if (isOtpExpired(record.expiresAt)) {
    throw AppError.badRequest("ERR_OTP_EXPIRED", "Verification code has expired. Request a new one.")
  }

  if (!hasAttemptsRemaining(record.attempts)) {
    throw AppError.tooManyRequests(
      "ERR_OTP_ATTEMPTS",
      "Too many incorrect attempts. Request a new verification code.",
    )
  }

  const matches = await verifyOtpCode(input.code, record.codeHash)

  if (!matches) {
    const attempts = await repo.incrementCodeAttempts(record.id)
    const remaining = Math.max(OTP_MAX_VERIFY_ATTEMPTS - attempts, 0)

    if (remaining === 0) {
      throw AppError.tooManyRequests(
        "ERR_OTP_ATTEMPTS",
        "Too many incorrect attempts. Request a new verification code.",
      )
    }

    throw AppError.badRequest(
      "ERR_OTP_INVALID",
      `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    )
  }

  await repo.consumeCode(record.id)
  await repo.markUserVerified(user.id)

  return { alreadyVerified: false }
}

/** AUTH-004 — issue a replacement code, subject to cooldown and hourly cap. */
export async function resendCode(input: ResendCodeInput): Promise<void> {
  const user = await repo.findUserByEmail(input.email)
  if (!user) {
    throw AppError.notFound("ERR_USER_NOT_FOUND", "No account found for this email")
  }

  if (user.isEmailVerified) {
    throw AppError.conflict("ERR_ALREADY_VERIFIED", "This email is already verified")
  }

  const newest = await repo.findNewestCode(user.id)
  const cooldownMs = resendCooldownRemainingMs(newest?.createdAt ?? null)

  if (cooldownMs > 0) {
    const seconds = Math.ceil(cooldownMs / 1000)
    throw AppError.tooManyRequests(
      "ERR_OTP_COOLDOWN",
      `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before requesting another code`,
    )
  }

  const recentCount = await repo.countCodesSince(user.id, resendWindowStart())
  if (hasReachedResendLimit(recentCount)) {
    throw AppError.tooManyRequests(
      "ERR_OTP_RESEND_LIMIT",
      "Too many codes requested. Please try again later.",
    )
  }

  await issueVerificationCode(user.id, user.email)
}

/** AUTH-005 / AUTH-006 / AUTH-007 — authenticate and mint a session token. */
export async function login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const user = await repo.findUserByEmail(input.email)

  if (!user) {
    await compareDummy(input.password)
    throw AppError.invalidCredentials()
  }

  const passwordMatches = await comparePassword(input.password, user.password)
  if (!passwordMatches) {
    throw AppError.invalidCredentials()
  }

  if (!user.isEmailVerified) {
    throw AppError.forbidden(
      "Please verify your email before logging in",
      "ERR_EMAIL_NOT_VERIFIED",
    )
  }

  const token = signAuthToken({
    sub: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: (user as Record<string, any>).avatarUrl ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  }
}

/** AUTH-008 / USER-001 — the caller's own profile. */
export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await repo.findPublicUserById(userId)
  if (!user) {
    throw AppError.notFound("ERR_USER_NOT_FOUND", "Account no longer exists")
  }
  return user
}

/** Updates user avatar profile picture. */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<PublicUser> {
  return repo.updateUserAvatar(userId, avatarUrl)
}
