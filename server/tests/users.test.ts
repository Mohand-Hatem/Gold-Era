import { describe, expect, it, vi } from "vitest"
import request from "supertest"

vi.mock("../src/config/prisma.js", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.id === "standard_user_cuid") {
            return {
              id: "standard_user_cuid",
              name: "Standard User",
              email: "user@example.com",
              role: "USER",
              isEmailVerified: true,
              tokenVersion: 0,
              createdAt: new Date(),
            }
          }
          return null
        }),
      },
    },
    disconnectPrisma: vi.fn(),
    default: {},
  }
})

import { app } from "../src/app.js"
import { signAuthToken } from "../src/services/token.service.js"

describe("Users & Admin Role Guards (RBAC)", () => {
  const userToken = signAuthToken({
    sub: "standard_user_cuid",
    role: "USER",
    tokenVersion: 0,
  })

  describe("Unauthenticated Access Restrictions", () => {
    it("GET /api/users returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/users")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("GET /api/stats/admin returns 401 for unauthenticated requests", async () => {
      const res = await request(app).get("/api/stats/admin")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })
  })

  describe("Non-Admin RBAC Protection (403 Forbidden)", () => {
    it("GET /api/users rejects USER role with 403 ERR_FORBIDDEN", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", [`access_token=${userToken}`])

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_FORBIDDEN")
    })

    it("PATCH /api/users/:id/role rejects USER role with 403 ERR_FORBIDDEN", async () => {
      const res = await request(app)
        .patch("/api/users/some-user-id/role")
        .set("Cookie", [`access_token=${userToken}`])
        .send({ role: "ADMIN" })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_FORBIDDEN")
    })

    it("DELETE /api/users/:id rejects USER role with 403 ERR_FORBIDDEN", async () => {
      const res = await request(app)
        .delete("/api/users/some-user-id")
        .set("Cookie", [`access_token=${userToken}`])

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_FORBIDDEN")
    })

    it("GET /api/stats/admin rejects USER role with 403 ERR_FORBIDDEN", async () => {
      const res = await request(app)
        .get("/api/stats/admin")
        .set("Cookie", [`access_token=${userToken}`])

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_FORBIDDEN")
    })
  })
})
