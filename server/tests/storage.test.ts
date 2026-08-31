import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Storage service — Cloudinary URL construction (ADR-039).
 *
 * Regression coverage for a real production incident: `fetchBlobBuffer` and
 * `deliveryUrlFor` built delivery URLs from a bare `public_id`, but a `raw`
 * resource type uploaded with a `format` (every non-image file — signUpload
 * and uploadBlob both set it) is addressed by Cloudinary using the full path
 * *including* that extension. The bare URL 404s. This suite mocks only the
 * Cloudinary SDK itself, not storage.service — the files.service tests mock
 * storage.service wholesale and could not have caught a bug living inside it.
 */

const configMock = vi.fn()
const urlMock = vi.fn(() => "https://res.cloudinary.com/demo/raw/upload/v1/filox/abc.pdf")
const apiSignRequestMock = vi.fn(() => "signed")

vi.mock("cloudinary", () => ({
  v2: {
    config: configMock,
    url: urlMock,
    utils: { api_sign_request: apiSignRequestMock },
    uploader: { upload_stream: vi.fn(), destroy: vi.fn() },
  },
}))

const { deliveryUrlFor, fetchBlobBuffer, signUpload } = await import(
  "../src/services/storage.service.js"
)

const originalFetch = global.fetch

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  global.fetch = originalFetch
})

describe("deliveryUrlFor", () => {
  it("passes the format through to cloudinary.url() so raw assets resolve", () => {
    deliveryUrlFor("filox/abc", "raw", { format: "pdf" })

    expect(urlMock).toHaveBeenCalledWith(
      "filox/abc",
      expect.objectContaining({ format: "pdf", resource_type: "raw" }),
    )
  })

  it("omits format when none is given, rather than passing an empty string", () => {
    deliveryUrlFor("filox/abc", "image")

    expect(urlMock).toHaveBeenCalledWith(
      "filox/abc",
      expect.objectContaining({ format: undefined }),
    )
  })
})

describe("fetchBlobBuffer", () => {
  it("builds the delivery URL with the extension the file was uploaded under", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("hello").buffer,
    }) as unknown as typeof fetch

    await fetchBlobBuffer("filox/abc", "raw", "pdf")

    expect(urlMock).toHaveBeenCalledWith(
      "filox/abc",
      expect.objectContaining({ format: "pdf" }),
    )
  })
})

describe("signUpload", () => {
  it("signs the same format it will later be delivered under", () => {
    const sig = signUpload("pdf", "application/pdf")
    expect(sig.format).toBe("pdf")
    expect(apiSignRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ format: "pdf" }),
      expect.any(String),
    )
  })
})
