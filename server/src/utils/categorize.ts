import { FileCategory } from "@prisma/client"

/**
 * Maps a MIME type to the coarse category used for filtering and statistics
 * (ADR-024, docs/21).
 *
 * Deliberately coarse: four buckets are enough to drive a filter dropdown and a
 * distribution chart, and a finer taxonomy would need maintaining for no gain.
 */
export function categorizeMimeType(mimeType: string): FileCategory {
  if (mimeType.startsWith("image/")) {
    return FileCategory.IMAGE
  }

  if (
    mimeType === "application/pdf" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return FileCategory.DOCUMENT
  }

  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return FileCategory.TEXT
  }

  return FileCategory.OTHER
}
