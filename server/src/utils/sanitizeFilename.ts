import { MAX_ORIGINAL_NAME_LENGTH } from "../config/constants.js"

/**
 * Filename sanitisation for display (ADR-016).
 *
 * The result is stored as `File.originalName` and shown in the UI. It is never
 * used to build a filesystem path or a storage key — those are generated UUIDs —
 * so this guards against display-layer problems (control characters, absurd
 * lengths) and defends in depth against path separators leaking anywhere.
 */
export function sanitizeFilename(input: string): string {
  const withoutPaths = input
    // Strip directory components from clients that send a full path.
    .replace(/^.*[\\/]/, "")
    // Remove control characters (U+0000–U+001F, U+007F).
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    // Reserved on Windows filesystems.
    .replace(/[<>:"|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    // A leading dot hides the file on unix and can produce an empty stem.
    .replace(/^\.+/, "")
    .trim()

  if (withoutPaths.length === 0) {
    return "file"
  }

  if (withoutPaths.length <= MAX_ORIGINAL_NAME_LENGTH) {
    return withoutPaths
  }

  // Truncate the stem, keep the extension, so the name stays recognisable.
  const lastDot = withoutPaths.lastIndexOf(".")
  if (lastDot > 0 && withoutPaths.length - lastDot <= 12) {
    const extension = withoutPaths.slice(lastDot)
    const stem = withoutPaths.slice(0, MAX_ORIGINAL_NAME_LENGTH - extension.length)
    return `${stem}${extension}`
  }

  return withoutPaths.slice(0, MAX_ORIGINAL_NAME_LENGTH)
}

/** Lowercase extension without the dot. Empty string when there is none. */
export function extractExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  if (lastDot <= 0 || lastDot === filename.length - 1) return ""
  return filename.slice(lastDot + 1).toLowerCase()
}
