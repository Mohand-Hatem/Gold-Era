import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Mail delivery tests (ADR-011).
 *
 * Nodemailer is mocked at the module boundary — these tests never open a socket
 * and never send a real message. The central guarantee under test is that a
 * verification code reaches the SMTP payload and nothing else: not the logs, not
 * a fallback channel, not an error message.
 */

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))

vi.mock("nodemailer", () => ({
  default: { createTransport },
  createTransport,
}))

const { isMailConfigured, resetTransporter, sendOtpEmail } = await import(
  "../src/services/mail.service.js"
)

const CODE = "482915"
const RECIPIENT = "recipient@example.com"

let logSpy: ReturnType<typeof vi.spyOn>
let errorSpy: ReturnType<typeof vi.spyOn>

/** Everything the service wrote to stdout/stderr during a test, as one string. */
function capturedOutput(): string {
  return [...logSpy.mock.calls, ...errorSpy.mock.calls]
    .flat()
    .map((arg) => (arg instanceof Error ? `${arg.message} ${arg.stack ?? ""}` : String(arg)))
    .join("\n")
}

beforeEach(() => {
  vi.clearAllMocks()
  resetTransporter()
  sendMail.mockResolvedValue({ messageId: "test-message-id" })
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Mail Service — Nodemailer + Gmail SMTP", () => {
  describe("transport configuration", () => {
    it("reports configured when SMTP credentials are present", () => {
      expect(isMailConfigured()).toBe(true)
    })

    it("builds a single Gmail SMTP transport with implicit TLS on port 465", async () => {
      await sendOtpEmail(RECIPIENT, CODE)

      expect(createTransport).toHaveBeenCalledTimes(1)
      const config = createTransport.mock.calls[0]![0] as Record<string, unknown>

      expect(config.host).toBe("smtp.gmail.com")
      expect(config.port).toBe(465)
      expect(config.secure).toBe(true)
      // Railway resolves an unroutable IPv6 address for smtp.gmail.com.
      expect(config.family).toBe(4)
      // Certificate validation must stay on.
      expect(config.tls).toBeUndefined()
    })

    it("reuses the transport across sends", async () => {
      await sendOtpEmail(RECIPIENT, CODE)
      await sendOtpEmail(RECIPIENT, CODE)

      expect(createTransport).toHaveBeenCalledTimes(1)
      expect(sendMail).toHaveBeenCalledTimes(2)
    })
  })

  describe("successful delivery", () => {
    it("sends the code to the registered address via Nodemailer", async () => {
      await expect(sendOtpEmail(RECIPIENT, CODE)).resolves.toBeUndefined()

      expect(sendMail).toHaveBeenCalledTimes(1)
      const message = sendMail.mock.calls[0]![0] as Record<string, string>

      expect(message.to).toBe(RECIPIENT)
      expect(message.subject).toContain("Filox")
      expect(message.text).toContain(CODE)
      expect(message.html).toContain(CODE)
    })

    it("includes purpose, expiry, security warning and app name in the email", async () => {
      await sendOtpEmail(RECIPIENT, CODE)
      const message = sendMail.mock.calls[0]![0] as Record<string, string>

      for (const body of [message.text, message.html]) {
        expect(body).toContain("Filox")
        expect(body).toContain("verify")
        expect(body).toMatch(/expires in .*10 .*minutes/s)
        expect(body).toContain("never ask you for this code")
      }
    })

    it("never writes the code to the logs on success", async () => {
      await sendOtpEmail(RECIPIENT, CODE)

      expect(capturedOutput()).not.toContain(CODE)
      expect(capturedOutput()).toContain("Verification email sent successfully")
    })
  })

  describe("delivery failure", () => {
    const timeout = Object.assign(new Error("Connection timeout"), { code: "ETIMEDOUT" })

    beforeEach(() => {
      sendMail.mockRejectedValue(timeout)
    })

    it("propagates the failure instead of reporting success", async () => {
      await expect(sendOtpEmail(RECIPIENT, CODE)).rejects.toThrow("Connection timeout")
    })

    it("does not log the code, and does not fall back to any other channel", async () => {
      await expect(sendOtpEmail(RECIPIENT, CODE)).rejects.toThrow()

      const output = capturedOutput()
      expect(output).not.toContain(CODE)
      expect(output).not.toMatch(/fallback/i)
      expect(output).toContain("Failed to send verification email")
      // One transport, one attempt — no second provider is tried.
      expect(sendMail).toHaveBeenCalledTimes(1)
    })

    it("never logs SMTP credentials", async () => {
      await expect(sendOtpEmail(RECIPIENT, CODE)).rejects.toThrow()

      const output = capturedOutput()
      expect(output).not.toContain("test-app-password")
    })
  })
})
