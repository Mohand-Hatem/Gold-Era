import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Behaviour when SMTP credentials are absent.
 *
 * The frozen `env` singleton is mocked here rather than mutated, so this lives
 * in its own file: a missing App Password must fail loudly, never degrade into
 * printing the code.
 */

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))

vi.mock("nodemailer", () => ({
  default: { createTransport },
  createTransport,
}))

vi.mock("../src/config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    OTP_TTL_MINUTES: 10,
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: 465,
    SMTP_SECURE: true,
    SMTP_USER: undefined,
    SMTP_PASSWORD: undefined,
    SMTP_FROM: undefined,
  },
  isProduction: false,
  isDevelopment: false,
  isTest: true,
}))

const { isMailConfigured, sendOtpEmail } = await import("../src/services/mail.service.js")

const CODE = "731204"

let logSpy: ReturnType<typeof vi.spyOn>
let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.clearAllMocks()
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("Mail Service — missing SMTP configuration", () => {
  it("reports itself as unconfigured", () => {
    expect(isMailConfigured()).toBe(false)
  })

  it("throws a clear configuration error instead of silently degrading", async () => {
    await expect(sendOtpEmail("recipient@example.com", CODE)).rejects.toThrow(
      /SMTP_USER and SMTP_PASSWORD/,
    )

    expect(createTransport).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()

    const output = [...logSpy.mock.calls, ...errorSpy.mock.calls].flat().map(String).join("\n")
    expect(output).not.toContain(CODE)
  })
})
