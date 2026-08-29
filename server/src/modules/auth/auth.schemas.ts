import { z } from "zod";

/**
 * Auth request schemas (docs/18 §1, §3).
 *
 * Backend validation is authoritative; the frontend's copy is UX only (CON-05).
 * Email is lowercased here so uniqueness cannot be bypassed by casing.
 */

const email = z
  .email("Invalid email address")
  .max(254, "Email is too long")
  .transform((value) => value.trim().toLowerCase());

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

/**
 * Password rules: at least 8 characters with a letter and a digit.
 *
 * Capped at 72 bytes because bcrypt silently ignores anything beyond that —
 * accepting longer input would create passwords whose tail is meaningless.
 */
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .refine((value) => /[A-Za-z]/.test(value), "Password must contain a letter")
  .refine((value) => /\d/.test(value), "Password must contain a number");

const otpCode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Verification code must be 6 digits");

export const registerSchema = z.object({ name, email, password });
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({ email, code: otpCode });
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendCodeSchema = z.object({ email });
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;

/**
 * Login intentionally does not apply the strength rules above: an existing
 * account may predate a rule change, and rejecting at validation would reveal
 * that the format was wrong rather than the credentials.
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;
