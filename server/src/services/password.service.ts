import bcrypt from "bcrypt"

import { BCRYPT_COST } from "../config/constants.js"

/**
 * Password hashing (BE-010, ADR-018, NFR-001).
 *
 * bcrypt at cost 12. Plaintext passwords are never stored, logged, or returned.
 */

/** Hashes a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

/** Verifies a plaintext password against a stored hash. */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * A real bcrypt hash of a throwaway value, used only by `compareDummy`.
 * Generated once at module load so the cost is paid outside request handling.
 */
const DUMMY_HASH = bcrypt.hashSync("filox-dummy-password-for-timing-parity", BCRYPT_COST)

/**
 * Performs a bcrypt comparison whose result is discarded.
 *
 * Login must take the same time whether or not the email exists, otherwise
 * response timing reveals which accounts are registered (docs/20 §1, §8).
 * Call this on the "user not found" branch before returning the generic
 * invalid-credentials error.
 */
export async function compareDummy(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH)
}
