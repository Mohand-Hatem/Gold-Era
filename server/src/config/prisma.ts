import { PrismaClient } from "@prisma/client"

import { isProduction } from "./env.js"

/**
 * Prisma client singleton (DB-001b).
 *
 * A single instance is shared process-wide. Without this guard, `tsx watch`
 * would construct a new client on every hot reload and exhaust the database
 * connection pool within a few edits — see docs/15 §6.
 */

declare global {
  // eslint-disable-next-line no-var
  var __filoxPrisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    // Queries are noisy and can contain user data; log only what needs acting on.
    log: isProduction ? ["error"] : ["warn", "error"],
  })
}

export const prisma: PrismaClient = globalThis.__filoxPrisma ?? createPrismaClient()

if (!isProduction) {
  globalThis.__filoxPrisma = prisma
}

/** Closes the connection pool. Used by graceful shutdown and test teardown. */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

export default prisma
