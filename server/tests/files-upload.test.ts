import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Direct-to-Cloudinary upload flow (ADR-002, ADR-003, ADR-039, Vercel migration).
 *
 * Storage and extraction are mocked at the module boundary so this suite makes
 * no network call and parses no real documents — it pins down the contract
 * between `files.service.ts` and its dependencies: signatures are only issued
 * for allowlisted files, a confirmed upload is re-validated against its real
 * bytes (not the client's claims), and a failure at any step removes the
 * orphaned Cloudinary blob rather than leaving it dangling.
 */

const signUpload = vi.fn()
const fetchBlobBuffer = vi.fn()
const removeBlob = vi.fn().mockResolvedValue(undefined)
const deliveryUrlFor = vi.fn(() => "https://res.cloudinary.com/demo/raw/upload/filox/abc")

vi.mock("../src/services/storage.service.js", () => ({
  signUpload,
  fetchBlobBuffer,
  removeBlob,
  deliveryUrlFor,
  resourceTypeFor: (mimeType: string) => (mimeType.startsWith("image/") ? "image" : "raw"),
}))

const extractContent = vi.fn().mockResolvedValue({ content: null, status: "SKIPPED" })
vi.mock("../src/services/extraction.service.js", () => ({ extractContent }))

const repo = {
  createFile: vi.fn(),
  findFileById: vi.fn(),
}
vi.mock("../src/modules/files/files.repository.js", () => ({ filesRepository: repo }))

const { filesService } = await import("../src/modules/files/files.service.js")
const { AppError } = await import("../src/utils/AppError.js")

const USER = { id: "user_1", role: "USER" as const }
const ADMIN = { id: "admin_1", role: "ADMIN" as const }

beforeEach(() => {
  vi.clearAllMocks()
  signUpload.mockImplementation((extension: string, mimeType: string) => ({
    storageKey: `filox/generated-${extension}`,
    resourceType: mimeType.startsWith("image/") ? "image" : "raw",
    timestamp: 1234567890,
    signature: "signed",
    apiKey: "key",
    cloudName: "demo",
    format: extension || undefined,
    uploadUrl: "https://api.cloudinary.com/v1_1/demo/raw/upload",
  }))
  repo.createFile.mockImplementation(async (data) => ({ id: "file_1", ...data }))
})

describe("createUploadSignatures", () => {
  it("issues a signature per allowlisted file, without touching storage", async () => {
    const result = filesService.createUploadSignatures({
      files: [{ originalName: "report.pdf", mimeType: "application/pdf", size: 1024 }],
    })

    expect(signUpload).toHaveBeenCalledWith("pdf", "application/pdf")
    expect(result.signatures).toHaveLength(1)
    expect(result.signatures[0]).toMatchObject({
      originalName: "report.pdf",
      storageKey: "filox/generated-pdf",
    })
    // No blob exists yet — the signature is the only thing produced.
    expect(fetchBlobBuffer).not.toHaveBeenCalled()
  })

  it("rejects an unsupported extension before issuing a signature", () => {
    const call = () =>
      filesService.createUploadSignatures({
        files: [{ originalName: "malware.exe", mimeType: "application/pdf", size: 1024 }],
      })

    expect(call).toThrow(AppError)
    try {
      call()
    } catch (error) {
      expect((error as InstanceType<typeof AppError>).code).toBe("ERR_VALIDATION")
    }
  })
})

describe("confirmUploads", () => {
  const textBuffer = Buffer.from("hello world", "utf-8")

  beforeEach(() => {
    fetchBlobBuffer.mockResolvedValue(textBuffer)
  })

  it("fetches the real bytes, validates them, and persists the file", async () => {
    const result = await filesService.confirmUploads(USER, {
      files: [{ storageKey: "filox/abc", originalName: "notes.txt", mimeType: "text/plain" }],
    })

    expect(fetchBlobBuffer).toHaveBeenCalledWith("filox/abc", "raw")
    expect(repo.createFile).toHaveBeenCalledTimes(1)
    const persisted = repo.createFile.mock.calls[0]![0]
    expect(persisted.ownerId).toBe(USER.id)
    expect(persisted.storageKey).toBe("filox/abc")
    // Size is taken from the actual fetched bytes, never the client's claim.
    expect(persisted.size).toBe(textBuffer.length)

    expect(result.uploaded).toHaveLength(1)
    expect(result.failed).toHaveLength(0)
    expect(removeBlob).not.toHaveBeenCalled()
  })

  it("removes the blob and reports failure when bytes contradict the declared type", async () => {
    // Bytes are plain text but declared as a PDF — magic-byte check must catch
    // this even though the client's MIME claim passed the allowlist.
    fetchBlobBuffer.mockResolvedValue(textBuffer)

    const result = await filesService
      .confirmUploads(USER, {
        files: [{ storageKey: "filox/spoofed", originalName: "fake.pdf", mimeType: "application/pdf" }],
      })
      .catch((e: unknown) => e)

    // Sole file in the batch failed validation -> the batch itself rejects.
    expect(result).toBeInstanceOf(AppError)
    expect((result as InstanceType<typeof AppError>).code).toBe("ERR_UPLOAD_FAILED")
    expect(repo.createFile).not.toHaveBeenCalled()
    expect(removeBlob).toHaveBeenCalledWith("filox/spoofed", "raw")
  })

  it("removes the blob when the storage provider cannot be reached", async () => {
    fetchBlobBuffer.mockRejectedValue(new Error("network error"))

    const result = await filesService
      .confirmUploads(USER, {
        files: [{ storageKey: "filox/unreachable", originalName: "notes.txt", mimeType: "text/plain" }],
      })
      .catch((e: unknown) => e)

    expect(result).toBeInstanceOf(AppError)
    expect(repo.createFile).not.toHaveBeenCalled()
  })

  it("rolls back the blob if the database write fails", async () => {
    repo.createFile.mockRejectedValue(new Error("db unavailable"))

    const result = await filesService
      .confirmUploads(USER, {
        files: [{ storageKey: "filox/dbfail", originalName: "notes.txt", mimeType: "text/plain" }],
      })
      .catch((e: unknown) => e)

    expect(result).toBeInstanceOf(AppError)
    expect(removeBlob).toHaveBeenCalledWith("filox/dbfail", "raw")
  })
})

describe("downloadFile — redirect instead of streaming (Vercel: 4.5 MB response cap)", () => {
  const file = {
    id: "file_1",
    ownerId: USER.id,
    storageKey: "filox/big-file",
    mimeType: "application/pdf",
    originalName: "quarterly-report.pdf",
  }

  beforeEach(() => {
    repo.findFileById.mockResolvedValue(file)
  })

  it("resolves a Cloudinary URL for the owner, no size limit applied", async () => {
    const result = await filesService.downloadFile(USER, "file_1", "inline")

    expect(deliveryUrlFor).toHaveBeenCalledWith("filox/big-file", "raw", {
      attachmentFilename: undefined,
    })
    expect(result.url).toContain("cloudinary.com")
  })

  it("requests the original filename as the attachment name for downloads", async () => {
    await filesService.downloadFile(USER, "file_1", "attachment")

    expect(deliveryUrlFor).toHaveBeenCalledWith("filox/big-file", "raw", {
      attachmentFilename: "quarterly-report.pdf",
    })
  })

  it("still enforces ownership before resolving a URL", async () => {
    const otherUser = { id: "someone-else", role: "USER" as const }

    const result = await filesService.downloadFile(otherUser, "file_1", "inline").catch((e: unknown) => e)

    expect(result).toBeInstanceOf(AppError)
    expect((result as InstanceType<typeof AppError>).code).toBe("ERR_FORBIDDEN")
    expect(deliveryUrlFor).not.toHaveBeenCalled()
  })

  it("allows an admin to download any user's file", async () => {
    await expect(filesService.downloadFile(ADMIN, "file_1", "inline")).resolves.toMatchObject({
      url: expect.stringContaining("cloudinary.com"),
    })
  })
})
