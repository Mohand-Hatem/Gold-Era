import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Registration / resend behaviour around email delivery (AUTH-001, AUTH-004).
 *
 * The repository and mail service are both mocked, so these run without a
 * database and without a socket. What they pin down is the contract between the
 * two: a code is persisted, delivery is awaited, and a delivery failure becomes
 * a safe 503 that carries no code.
 */

const sendOtpEmail = vi.fn()

vi.mock("../src/services/mail.service.js", () => ({
  sendOtpEmail,
  isMailConfigured: () => true,
}))

const repo = {
  findUserByEmail: vi.fn(),
  createUserWithCode: vi.fn(),
  createCode: vi.fn(),
  consumeAllActiveCodes: vi.fn(),
  findNewestCode: vi.fn(),
  countCodesSince: vi.fn(),
}

vi.mock("../src/modules/auth/auth.repository.js", () => repo)

const service = await import("../src/modules/auth/auth.service.js")
const { AppError } = await import("../src/utils/AppError.js")

const INPUT = { name: "Test User", email: "new@example.com", password: "SecretPassword123" }

let logSpy: ReturnType<typeof vi.spyOn>
let errorSpy: ReturnType<typeof vi.spyOn>

/** The plaintext code handed to the mail layer during this test. */
function dispatchedCode(): string {
  expect(sendOtpEmail).toHaveBeenCalled()
  return sendOtpEmail.mock.calls[0]![1] as string
}

function capturedOutput(): string {
  return [...logSpy.mock.calls, ...errorSpy.mock.calls]
    .flat()
    .map((arg) => (arg instanceof Error ? `${arg.message} ${arg.stack ?? ""}` : String(arg)))
    .join("\n")
}

beforeEach(() => {
  vi.clearAllMocks()
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  repo.findUserByEmail.mockResolvedValue(null)
  repo.createUserWithCode.mockResolvedValue({ id: "user_1", email: INPUT.email })
  repo.consumeAllActiveCodes.mockResolvedValue(undefined)
  repo.createCode.mockResolvedValue(undefined)
  repo.findNewestCode.mockResolvedValue(null)
  repo.countCodesSince.mockResolvedValue(0)
  sendOtpEmail.mockResolvedValue(undefined)
})

describe("Registration → OTP → email", () => {
  it("stores a hashed code and dispatches it, without returning it to the caller", async () => {
    const result = await service.register(INPUT)

    // Code persisted as a bcrypt hash, never plaintext.
    const stored = repo.createUserWithCode.mock.calls[0]![0] as Record<string, unknown>
    expect(stored.codeHash).toMatch(/^\$2[aby]\$/)
    expect(stored.codeHash).not.toBe(dispatchedCode())
    expect(stored.expiresAt).toBeInstanceOf(Date)

    // Delivered to the registered address.
    expect(sendOtpEmail).toHaveBeenCalledWith(INPUT.email, expect.stringMatching(/^\d{6}$/))

    // Response carries no code.
    expect(result).toEqual({ userId: "user_1", email: INPUT.email })
    expect(JSON.stringify(result)).not.toContain(dispatchedCode())
  })

  it("returns a safe 503 and logs no code when SMTP delivery fails", async () => {
    sendOtpEmail.mockRejectedValue(
      Object.assign(new Error("Connection timeout"), { code: "ETIMEDOUT" }),
    )

    const error = await service.register(INPUT).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AppError)
    const appError = error as InstanceType<typeof AppError>
    expect(appError.status).toBe(503)
    expect(appError.code).toBe("ERR_EMAIL_SEND_FAILED")
    expect(appError.message).toBe("Unable to send verification email. Please try again.")

    // The message must not leak the code or the transport detail.
    expect(appError.message).not.toContain(dispatchedCode())
    expect(capturedOutput()).not.toContain(dispatchedCode())
  })
})

describe("Resend → OTP → email", () => {
  const unverified = { id: "user_1", email: INPUT.email, isEmailVerified: false }

  beforeEach(() => {
    repo.findUserByEmail.mockResolvedValue(unverified)
  })

  it("invalidates prior codes before issuing and sending a replacement", async () => {
    await service.resendCode({ email: INPUT.email })

    expect(repo.consumeAllActiveCodes).toHaveBeenCalledWith("user_1")
    expect(repo.createCode).toHaveBeenCalledTimes(1)
    expect(sendOtpEmail).toHaveBeenCalledWith(INPUT.email, expect.stringMatching(/^\d{6}$/))
  })

  it("surfaces a delivery failure as a safe 503", async () => {
    sendOtpEmail.mockRejectedValue(new Error("Connection timeout"))

    const error = await service.resendCode({ email: INPUT.email }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as InstanceType<typeof AppError>).code).toBe("ERR_EMAIL_SEND_FAILED")
    expect(capturedOutput()).not.toContain(dispatchedCode())
  })
})
