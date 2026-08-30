import { describe, expect, it } from "vitest"
import request from "supertest"
import { app } from "../src/app.js"
import { comparePassword, hashPassword } from "../src/services/password.service.js"
import { signAuthToken, verifyAuthToken } from "../src/services/token.service.js"
import { generateOtpCode, hashOtpCode } from "../src/services/otp.service.js"

describe("Auth Services & Security Primitives", () => {
  describe("Password Service (Bcrypt 12 rounds)", () => {
    it("hashes and verifies passwords correctly", async () => {
      const plain = "SecretPassword123"
      const hash = await hashPassword(plain)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(plain)
      expect(hash).toMatch(/^\$2[aby]\$12\$/) // Bcrypt cost factor 12

      const isValid = await comparePassword(plain, hash)
      expect(isValid).toBe(true)

      const isInvalid = await comparePassword("WrongPassword123", hash)
      expect(isInvalid).toBe(false)
    })
  })

  describe("Token Service (JWT)", () => {
    it("generates and verifies valid tokens", () => {
      const payload = {
        sub: "user_test_123",
        role: "USER" as const,
        tokenVersion: 0,
      }

      const token = signAuthToken(payload)
      expect(token).toBeDefined()
      expect(typeof token).toBe("string")

      const decoded = verifyAuthToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.sub).toBe(payload.sub)
      expect(decoded?.role).toBe(payload.role)
      expect(decoded?.tokenVersion).toBe(payload.tokenVersion)
    })

    it("returns null when verifying an invalid token", () => {
      const decoded = verifyAuthToken("invalid-garbage-token")
      expect(decoded).toBeNull()
    })
  })

  describe("OTP Service", () => {
    it("generates 6-digit numeric codes and hashes", async () => {
      const code = generateOtpCode()
      expect(code).toMatch(/^\d{6}$/)

      const hash = await hashOtpCode(code)
      expect(hash).toBeDefined()
      expect(typeof hash).toBe("string")
      expect(hash.startsWith("$2")).toBe(true)
    })
  })

  describe("Auth HTTP Endpoints Validation", () => {
    it("POST /api/auth/register rejects missing or invalid fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "",
        email: "not-an-email",
        password: "short",
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_VALIDATION")
      expect(res.body.error.details).toBeDefined()
    })

    it("POST /api/auth/login rejects empty payload", async () => {
      const res = await request(app).post("/api/auth/login").send({})

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_VALIDATION")
    })

    it("POST /api/auth/logout succeeds and clears session cookie", async () => {
      const res = await request(app).post("/api/auth/logout")

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        success: true,
        data: {
          message: "Logged out",
        },
      })
      // Check Set-Cookie clears access_token
      const cookies = res.headers["set-cookie"]
      if (cookies) {
        const cookieStr = Array.isArray(cookies) ? cookies.join(";") : cookies
        expect(cookieStr).toContain("access_token=")
      }
    })
  })
})
