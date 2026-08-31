import nodemailer, { type Transporter } from "nodemailer"

import { env } from "../config/env.js"
import { OTP_TTL_MS } from "../config/constants.js"

/**
 * Outbound email (BE-013, ADR-011).
 *
 * Gmail SMTP via nodemailer using an App Password. Configured with explicit IPv4
 * and port 465/587 to prevent IPv6 ENETUNREACH issues on cloud container runtimes (Railway/Docker).
 */

const OTP_TTL_MINUTES = Math.round(OTP_TTL_MS / 60_000)

/** True when Gmail credentials are configured. */
export function isMailConfigured(): boolean {
  return Boolean(env.GMAIL_USER && env.GMAIL_PASS)
}

let transporter: Transporter | null = null

/** Lazily builds the SMTP transport forced to IPv4 so Railway/Docker never hits IPv6 ENETUNREACH. */
function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null

  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_PASS,
    },
    // Force IPv4 resolution to prevent ENETUNREACH on Railway
    family: 4,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  } as any)

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
    '<div style="font-family:system-ui,sans-serif;line-height:1.5;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">',
    '<h2 style="color:#0f172a;margin-bottom:8px">Welcome to Filox</h2>',
    '<p style="color:#64748b;font-size:14px">Your 6-digit verification code is:</p>',
    `<div style="font-size:32px;font-weight:800;letter-spacing:6px;color:#2563eb;padding:16px 0">${code}</div>`,
    `<p style="color:#64748b;font-size:12px">This code expires in ${OTP_TTL_MINUTES} minutes.</p>`,
    '<p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:12px">If you did not create a Filox account, you can safely ignore this email.</p>',
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
    console.log(`[mail] SMTP not configured — verification code for ${to}: ${code}`)
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
    console.log(`[mail] verification code sent successfully via SMTP to ${to}`)
    return true
  } catch (error) {
    console.error(`[mail] failed to send verification code via SMTP to ${to}:`, error)
    console.log(`[mail] FALLBACK — verification code for ${to}: ${code}`)
    return false
  }
}
