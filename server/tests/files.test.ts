import { describe, expect, it } from "vitest"
import request from "supertest"
import { app } from "../src/app.js"
import { extractExtension, sanitizeFilename } from "../src/utils/sanitizeFilename.js"

describe("Files Module & Sanitization", () => {
  describe("Filename Sanitization Utility (ADR-016)", () => {
    it("strips directory paths and dangerous characters", () => {
      expect(sanitizeFilename("C:\\Users\\Desktop\\invoice.pdf")).toBe("invoice.pdf")
      expect(sanitizeFilename("/var/log/../../secret.txt")).toBe("secret.txt")
      expect(sanitizeFilename("file<name>:test?.docx")).toBe("filenametest.docx")
      expect(sanitizeFilename("   spaced  name.png   ")).toBe("spaced name.png")
      expect(sanitizeFilename("")).toBe("file")
    })

    it("extracts clean lowercase extensions", () => {
      expect(extractExtension("REPORT.PDF")).toBe("pdf")
      expect(extractExtension("archive.tar.gz")).toBe("gz")
      expect(extractExtension("no_extension")).toBe("")
      expect(extractExtension(".hidden")).toBe("")
    })
  })

  describe("File Endpoints Authentication Guards (P0)", () => {
    it("GET /api/files rejects unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/files")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("GET /api/files/:id rejects unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/files/some-file-id")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("POST /api/files/upload-signature rejects unauthenticated request with 401", async () => {
      const res = await request(app).post("/api/files/upload-signature")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("POST /api/files/confirm rejects unauthenticated request with 401", async () => {
      const res = await request(app).post("/api/files/confirm")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("GET /api/files/:id/download rejects unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/files/some-file-id/download")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })

    it("DELETE /api/files/:id rejects unauthenticated deletion with 401", async () => {
      const res = await request(app).delete("/api/files/some-file-id")
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.error.code).toBe("ERR_UNAUTHENTICATED")
    })
  })
})
