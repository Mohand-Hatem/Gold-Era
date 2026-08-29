import nodemailer, { type Transporter } from "nodemailer"

import { env, isProduction } from "../config/env"
import { OTP_TTL_MS } from "../config/constants"

/**
 * Outbound email (BE-013, ADR-011).
 *
 * Gmail SMTP via nodemailer using an App Password. When credentials are absent
 * — the normal local-development state — the code is written to the console
 * instead so the verification flow remains testable without a mailbox.
 *
 * Send failures never throw. Registration must not roll back because an email
 * provider was briefly unavailable: the user would be left unable to register at
 * all, whereas a missing email is recoverable through `POST /auth/resend-code`.
 */

const OTP_TTL_MINUTES = Math.round(OTP_TTL_MS / 60_000)

/** True when Gmail credentials are configured. */
export function isMailConfigured(): boolean {
  return Boolean(env.GMAIL_USER && env.GMAIL_PASS)
}

let transporter: Transporter | null = null

/** Lazily builds the SMTP transport so unconfigured environments never open a socket. */
function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null

  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_PASS,
    },
  })

  return transporter
}

function buildOtpMessage(code: string): { subject: string; text: string; html: string } {
  const subject = "Your Filox verification code"

  const text = [
    "Welcome to Filox.",
    "",
    `Your verification code is: ${code}`,
    "",
    `This code expires in ${OTP_TTL_MINUTES} minutes.`,
    "If you did not create a Filox account, you can ignore this email.",
  ].join("\n")

  const html = [
    '<div style="font-family:system-ui,sans-serif;line-height:1.5">',
    "<h2>Welcome to Filox</h2>",
    "<p>Your verification code is:</p>",
    `<p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>`,
    `<p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>`,
    "<p>If you did not create a Filox account, you can ignore this email.</p>",
    "</div>",
  ].join("")

  return { subject, text, html }
}

/**
 * Sends a verification code.
 *
 * Returns `true` when handed to SMTP successfully, `false` when it failed or was
 * only logged. Callers treat the result as advisory, not as a reason to fail.
 */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const mail = getTransporter()

  if (!mail) {
    // Development fallback. Guarded so a misconfigured production deployment can
    // never print a live code into its logs (docs/20 §7).
    if (!isProduction) {
      console.log(`[mail] SMTP not configured — verification code for ${to}: ${code}`)
    } else {
      console.error(`[mail] cannot send verification code to ${to}: GMAIL_USER/GMAIL_PASS unset`)
    }
    return false
  }

  const { subject, text, html } = buildOtpMessage(code)

  try {
    await mail.sendMail({
      from: `"Filox" <${env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    })
    return true
  } catch (error) {
    console.error(`[mail] failed to send verification code to ${to}:`, error)
    return false
  }
}
