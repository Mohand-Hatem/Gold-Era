import nodemailer, { type Transporter } from "nodemailer"

import { env } from "../config/env.js"
import { OTP_TTL_MS } from "../config/constants.js"

/**
 * Outbound email delivery (BE-013, ADR-011).
 *
 * Supports:
 * 1. Resend REST API (Recommended for Railway/Vercel/Cloud — uses HTTPS port 443 with 100% cloud delivery).
 * 2. Gmail SMTP via Nodemailer (Port 587 STARTTLS).
 * 3. Terminal/Console Fallback (Logs verification code for zero-setup local testing).
 */

const OTP_TTL_MINUTES = Math.round(OTP_TTL_MS / 60_000)

/** True when either Resend or Gmail credentials are configured. */
export function isMailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY || (env.GMAIL_USER && env.GMAIL_PASS))
}

let transporter: Transporter | null = null

/** Lazily builds the SMTP transport using port 587 STARTTLS and IPv4. */
function getTransporter(): Transporter | null {
  if (!env.GMAIL_USER || !env.GMAIL_PASS) return null

  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Port 587 uses STARTTLS
    requireTLS: true,
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_PASS,
    },
    family: 4, // Force IPv4
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
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
    '<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background-color:#ffffff">',
    '<h2 style="color:#0f172a;margin-bottom:8px;font-size:22px">Welcome to Filox</h2>',
    '<p style="color:#64748b;font-size:14px;margin-bottom:16px">Enter the following 6-digit verification code to activate your account:</p>',
    `<div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb;padding:18px;background-color:#eff6ff;border-radius:12px;text-align:center;font-family:monospace">${code}</div>`,
    `<p style="color:#64748b;font-size:12px;margin-top:16px">⏳ This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p>`,
    '<p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:12px">If you did not create a Filox account, you can safely ignore this email.</p>',
    "</div>",
  ].join("")

  return { subject, text, html }
}

/** Sends an email via Resend HTTPS API (never blocked by cloud firewalls). */
async function sendViaResend(to: string, subject: string, text: string, html: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [to],
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Resend API HTTP ${response.status}: ${errorBody}`)
  }

  return true
}

/**
 * Sends a verification code.
 *
 * Returns `true` when sent successfully, `false` when it failed or was
 * only logged. Callers treat the result as advisory, not as a reason to fail.
 */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const { subject, text, html } = buildOtpMessage(code)

  // 1. Prioritize Resend HTTPS API if configured (Recommended for Railway/Vercel)
  if (env.RESEND_API_KEY) {
    try {
      await sendViaResend(to, subject, text, html)
      console.log(`[mail] verification code sent successfully via Resend HTTPS API to ${to}`)
      return true
    } catch (error) {
      console.error(`[mail] failed to send verification code via Resend to ${to}:`, error)
      console.log(`[mail] FALLBACK — verification code for ${to}: ${code}`)
      return false
    }
  }

  // 2. Secondary: Gmail SMTP via Nodemailer
  const mail = getTransporter()
  if (mail) {
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

  // 3. Console fallback
  console.log(`[mail] SMTP/Resend not configured — verification code for ${to}: ${code}`)
  return false
}
