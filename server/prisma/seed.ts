import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcrypt"

/**
 * Admin bootstrap seed (DB-004, ADR-019).
 *
 * Guarantees every environment has a working administrator, created from
 * environment variables and pre-verified so it can log in immediately.
 *
 * Idempotent: safe to run on every deploy. The `update` branch deliberately
 * omits `password` — re-seeding must not silently reset a password an operator
 * has changed since the first run.
 *
 * Runs standalone (not through src/config/env.ts) because Prisma executes this
 * file in its own process with its own env loading.
 */

const prisma = new PrismaClient()

const BCRYPT_COST = 12

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    console.error(`[seed] missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

async function main(): Promise<void> {
  const email = requireEnv("ADMIN_EMAIL", "admin@example.com").toLowerCase()
  const name = requireEnv("ADMIN_NAME", "Admin")
  const password = requireEnv("ADMIN_PASSWORD", "Admin123")

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email,
      name,
      password: passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    select: { id: true, email: true, name: true, role: true, isEmailVerified: true },
  })

  console.log(`[seed] admin ready: ${admin.email} (${admin.role}, verified=${admin.isEmailVerified})`)
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
