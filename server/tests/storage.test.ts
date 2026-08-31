import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Storage service — Cloudinary URL construction (ADR-039).
 *
 * Regression coverage for two real production incidents, both only visible
 * at this layer — the files.service tests mock storage.service wholesale and
 * could not have caught either bug living inside it:
 *
 * 1. `fetchBlobBuffer`/`deliveryUrlFor` built delivery URLs from a bare
 *    `public_id`, but a `raw` resource uploaded with a `format` (every
 *    non-image file) is addressed by Cloudinary using the full path
 *    *including* that extension. The bare URL 404d.
 * 2. Cloudinary's `fl_attachment:<name>` flag 400s the entire delivery
 *    request if `<name>` contains almost anything besides `[A-Za-z0-9 _-]` —
 *    every real filename with a dot, comma, colon, or non-ASCII character
 *    broke every attachment download.
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

  it("omits the flags option entirely when no attachment filename is requested", () => {
    deliveryUrlFor("filox/abc", "image", { format: "png" })

    expect(urlMock).toHaveBeenCalledWith(
      "filox/abc",
      expect.objectContaining({ flags: undefined }),
    )
  })

  describe("attachment filename sanitization — real production incident", () => {
    // Cloudinary's fl_attachment:<name> flag 400s the *entire* delivery
    // request if <name> contains almost anything besides [A-Za-z0-9 _-] —
    // confirmed live, one character class at a time: a literal dot anywhere
    // (not just a trailing extension), commas, colons, slashes, parentheses,
    // and any non-ASCII character. Percent-encoding does not help either.
    // Every one of these is a completely ordinary character in a real
    // uploaded filename, so this broke every attachment download.
    const cases: Array<[string, string]> = [
      ["My Photo 2024.png", "My Photo 2024"],
      ["screenshot.png", "screenshot"],
      ["Q1.2 Report, draft: v2.docx", "Q1 2 Report draft v2"],
      ["archive.tar.gz", "archive tar"],
      ["Résumé (final v2).pdf", "R sum final v2"],
    ]

    it.each(cases)("sanitizes %s down to a safe flag value", (input, expected) => {
      deliveryUrlFor("filox/abc", "raw", { attachmentFilename: input, format: "pdf" })

      expect(urlMock).toHaveBeenCalledWith(
        "filox/abc",
        expect.objectContaining({ flags: `attachment:${expected}` }),
      )
    })

    it("falls back to a generic name rather than an empty attachment flag", () => {
      // A filename with zero ASCII survivors must not produce `attachment:`
      // with nothing after the colon.
      deliveryUrlFor("filox/abc", "image", { attachmentFilename: "日本語.png", format: "png" })

      expect(urlMock).toHaveBeenCalledWith(
        "filox/abc",
        expect.objectContaining({ flags: "attachment:download" }),
      )
    })

    it("never treats a slash in the name as a path separator to discard", () => {
      // A naive `path.parse(name).name` silently drops everything before the
      // last "/", which would be a much worse UX regression than the 400 it
      // replaces. sanitizeFilename() already strips slashes before
      // `originalName` is stored, but this function must not additionally
      // assume that guarantee.
      deliveryUrlFor("filox/abc", "raw", {
        attachmentFilename: "notes/final.txt",
        format: "txt",
      })

      const flags = urlMock.mock.calls[0]![1].flags as string
      expect(flags).toContain("notes")
      expect(flags).toBe("attachment:notes final")
    })
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
