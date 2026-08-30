import { ExtractionStatus } from "@prisma/client"

import { MAX_EXTRACTED_CONTENT_CHARS } from "../config/constants.js"

/**
 * Text extraction (BE-022, ADR-005, ADR-006).
 *
 * Contract: **this module never throws.** A parser failure is an expected
 * outcome, not an exception — ADR-006 requires that a file is still stored when
 * extraction fails, so the failure is expressed as a return value and the caller
 * cannot forget to handle it.
 *
 * Images are deliberately not processed: OCR is out of scope (ADR-005, P3).
 */

export interface ExtractionResult {
  content: string | null
  status: ExtractionStatus
}

const PLAIN_TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "text/csv",
  "application/csv",
  "application/json",
])

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

/** Trims and caps extracted text (ADR-005). */
function normalise(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return null
  return trimmed.slice(0, MAX_EXTRACTED_CONTENT_CHARS)
}

/**
 * Decodes a buffer as UTF-8, rejecting binary content.
 *
 * A file whose extension claims to be text but whose bytes are not valid UTF-8
 * decodes with U+FFFD replacement characters. Storing that would put mojibake in
 * the details view, so it counts as a failed extraction.
 */
function decodeUtf8(buffer: Buffer): string | null {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer)
  return text.includes("\uFFFD") ? null : text
}

export async function extractContent(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractionResult> {
  try {
    if (mimeType.startsWith("image/")) {
      return { content: null, status: ExtractionStatus.SKIPPED }
    }

    if (PLAIN_TEXT_MIME_TYPES.has(mimeType)) {
      const decoded = decodeUtf8(buffer)
      if (decoded === null) {
        return { content: null, status: ExtractionStatus.FAILED }
      }
      return { content: normalise(decoded), status: ExtractionStatus.DONE }
    }

    if (mimeType === "application/pdf") {
      // Required lazily so a malformed install of the parser cannot prevent the
      // server from starting.
      const pdfParse = (await import("pdf-parse")).default
      const parsed = await pdfParse(buffer)
      // A scanned PDF yields no text. That is a successful extraction with an
      // empty result, not a failure — OCR is out of scope (ADR-005).
      return { content: normalise(parsed.text), status: ExtractionStatus.DONE }
    }

    if (mimeType === DOCX_MIME_TYPE) {
      const mammoth = await import("mammoth")
      const result = await mammoth.extractRawText({ buffer })
      return { content: normalise(result.value), status: ExtractionStatus.DONE }
    }

    return { content: null, status: ExtractionStatus.SKIPPED }
  } catch (error) {
    // Corrupt PDF, malformed docx, encrypted document, unexpected parser bug.
    // The upload still succeeds (ADR-006).
    console.error(`[extraction] failed for ${mimeType}:`, error)
    return { content: null, status: ExtractionStatus.FAILED }
  }
}
