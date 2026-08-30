import type { Prisma, User, VerificationCode } from "@prisma/client"

import { prisma } from "../../config/prisma.js"

/**
 * Auth data access (docs/15).
 *
 * Prisma queries only — no business rules, no HTTP concerns. Every `select`
 * that returns a user to a caller goes through PUBLIC_USER_SELECT so the
 * password hash cannot leak from a new call site with an incomplete select.
 */

export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isEmailVerified: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>

// ── Users ───────────────────────────────────────────────────────────────────

/** Full record including the password hash. For credential checks only. */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } })
}

export async function findPublicUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT })
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<PublicUser> {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: PUBLIC_USER_SELECT,
  })
}

/**
 * Creates an unverified user together with its first verification code.
 *
 * Transactional so a user can never exist without a code to verify it — that
 * state would leave the account unreachable until a manual resend.
 */
export async function createUserWithCode(input: {
  name: string
  email: string
  passwordHash: string
  codeHash: string
  expiresAt: Date
}): Promise<{ id: string; email: string }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.passwordHash,
      },
      select: { id: true, email: true },
    })

    await tx.verificationCode.create({
      data: {
        userId: user.id,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
      },
    })

    return user
  })
}

export async function markUserVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  })
}

// ── Verification codes ──────────────────────────────────────────────────────

/** Newest code that has not been consumed. The only code eligible for verification. */
export async function findNewestActiveCode(userId: string): Promise<VerificationCode | null> {
  return prisma.verificationCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  })
}

/** Newest code regardless of state — drives the resend cooldown. */
export async function findNewestCode(userId: string): Promise<VerificationCode | null> {
  return prisma.verificationCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

/** Codes issued since `since` — drives the hourly resend cap. */
export async function countCodesSince(userId: string, since: Date): Promise<number> {
  return prisma.verificationCode.count({
    where: { userId, createdAt: { gte: since } },
  })
}

export async function incrementCodeAttempts(codeId: string): Promise<number> {
  const updated = await prisma.verificationCode.update({
    where: { id: codeId },
    data: { attempts: { increment: 1 } },
    select: { attempts: true },
  })
  return updated.attempts
}

export async function consumeCode(codeId: string): Promise<void> {
  await prisma.verificationCode.update({
    where: { id: codeId },
    data: { consumedAt: new Date() },
  })
}

/**
 * Marks every active code consumed. Called before issuing a replacement so only
 * the newest code is ever valid.
 *
 * Rows are marked rather than deleted: `createdAt` history is what the hourly
 * resend cap counts, and deleting it would silently defeat the limit.
 */
export async function consumeAllActiveCodes(userId: string): Promise<void> {
  await prisma.verificationCode.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: new Date() },
  })
}

export async function createCode(input: {
  userId: string
  codeHash: string
  expiresAt: Date
}): Promise<void> {
  await prisma.verificationCode.create({ data: input })
}
