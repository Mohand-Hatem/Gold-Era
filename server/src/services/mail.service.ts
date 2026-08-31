import { promises as dns } from "node:dns"
import net from "node:net"

import nodemailer, { type Transporter } from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js"

import { env } from "../config/env.js"
import { OTP_TTL_MS } from "../config/constants.js"

/**
 * Outbound email delivery (BE-013, ADR-011).
 *
 * One delivery path, no alternatives:
 *
 *   Nodemailer → Gmail SMTP (smtp.gmail.com:465, implicit TLS)
 *
 * There is deliberately no fallback. A code that cannot be delivered is a
 * failure the caller must surface — printing it to the console would publish a
 * live credential to anyone with log access (docs/20 §8).
 */

const OTP_TTL_MINUTES = Math.round(OTP_TTL_MS / 60_000)

/** True when the SMTP credentials needed to send are present. */
export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_USER && env.SMTP_PASSWORD)
}

let transporter: Transporter | null = null

/**
 * Resolves an SMTP host to an IPv4 address.
 *
 * Nodemailer's `family` option cannot do this. Internally it resolves the
 * hostname itself (`resolve4` *and* `resolve6`), concatenates both lists and
 * picks one **at random** (lib/shared/index.js), then connects to that literal
 * — so `family` never reaches a name lookup. Railway containers cannot route
 * IPv6, so every random AAAA pick fails instantly with ENETUNREACH.
 *
 * Passing an IPv4 literal short-circuits that resolver and makes the choice
 * deterministic. The hostname is kept as the TLS `servername` so SNI and
 * certificate validation still check against smtp.gmail.com.
 */
async function resolveIpv4Host(hostname: string): Promise<string> {
  if (net.isIP(hostname)) return hostname

  const [address] = await dns.resolve4(hostname)
  if (!address) {
    throw new Error(`No IPv4 address found for ${hostname}`)
  }

  return address
}

/**
 * Lazily builds the Gmail SMTP transport.
 *
 * Throws rather than returning null — a missing password is a deployment
 * mistake, and the only safe response is a loud one.
 */
async function getTransporter(): Promise<Transporter> {
  if (!isMailConfigured()) {
    throw new Error(
      "Mail is not configured: SMTP_USER and SMTP_PASSWORD are required to send email",
    )
  }

  if (transporter) return transporter

  const address = await resolveIpv4Host(env.SMTP_HOST)

  const options: SMTPTransport.Options = {
    host: address,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    // Certificate is issued to the hostname, not the address we dialled.
    tls: { servername: env.SMTP_HOST },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  }

  transporter = nodemailer.createTransport(options)

  return transporter
}

/** Test seam: drops the memoised transport so a new config takes effect. */
export function resetTransporter(): void {
  transporter = null
}

function buildOtpMessage(code: string): { subject: string; text: string; html: string } {
  const subject = "Your Filox verification code"

  const text = [
    "Welcome to Filox.",
    "",
    `Your verification code is: ${code}`,
    "",
    `Enter this code to verify your email address. It expires in ${OTP_TTL_MINUTES} minutes.`,
    "",
    "Filox will never ask you for this code. If you did not create a Filox account,",
    "ignore this email — no account will be activated without the code above.",
  ].join("\n")

  const html = [
    '<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background-color:#ffffff">',
    '<h2 style="color:#0f172a;margin-bottom:8px;font-size:22px">Welcome to Filox</h2>',
    '<p style="color:#64748b;font-size:14px;margin-bottom:16px">Enter the following 6-digit code to verify your email address and activate your account:</p>',
    `<div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb;padding:18px;background-color:#eff6ff;border-radius:12px;text-align:center;font-family:monospace">${code}</div>`,
    `<p style="color:#64748b;font-size:12px;margin-top:16px">This code expires in <strong>${OTP_TTL_MINUTES} minutes</strong>.</p>`,
    '<p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:12px">Filox will never ask you for this code. If you did not create a Filox account, ignore this email — no account will be activated without it.</p>',
    "</div>",
  ].join("")

  return { subject, text, html }
}

/**
 * Sends a verification code to the registered email address.
 *
 * Rejects when delivery fails. Never logs the code, the recipient's credentials,
 * or the SMTP password.
 */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { subject, text, html } = buildOtpMessage(code)
  const mail = await getTransporter()

  console.log(`[mail] Sending verification email to ${to}`)

  try {
    await mail.sendMail({
      from: env.SMTP_FROM || `"Filox" <${env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })
  } catch (error) {
    // Drop the transport so the next attempt re-resolves: Gmail rotates its
    // SMTP addresses, and a long-lived process must not pin a dead one.
    resetTransporter()

    const reason = error instanceof Error ? error.message : "unknown error"
    console.error(`[mail] Failed to send verification email to ${to}: ${reason}`)
    throw error
  }

  console.log(`[mail] Verification email sent successfully to ${to}`)
}
