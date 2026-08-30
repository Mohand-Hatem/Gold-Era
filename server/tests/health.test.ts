import { describe, expect, it } from "vitest"
import request from "supertest"
import { app } from "../src/app.js"

describe("Health & System Routes", () => {
  it("GET /health returns HTTP 200 with status ok", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("status", "ok")
    expect(res.body).toHaveProperty("uptime")
    expect(res.body).toHaveProperty("timestamp")
  })

  it("GET /unknown-route returns 404 with standardized error envelope", async () => {
    const res = await request(app).get("/api/non-existent-route-endpoint")
    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: {
        code: "ERR_NOT_FOUND",
        message: "Route not found: GET /api/non-existent-route-endpoint",
      },
    })
  })
})
