import multer from "multer"

import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  EXTENSION_MIME_MAP,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from "../config/constants.js"
import { AppError } from "../utils/AppError.js"
import { extractExtension } from "../utils/sanitizeFilename.js"

/**
 * Multipart upload parsing (BE-021, ADR-002, ADR-003).
 *
 * `memoryStorage` is used so the buffer is available for validation *before*
 * anything is persisted. This is the reason `multer-storage-cloudinary` was
 * rejected: it uploads during parsing, which would put a spoofed file in the
 * storage account before extension, MIME, and magic-byte checks could run
 * (ADR-039, docs/13).
 *
 * `fileFilter` performs the cheap checks only. Magic-byte sniffing needs the
 * complete buffer, which does not exist yet at filter time, so it happens in the
 * files service.
 */

const allowedExtensions = new Set<string>(ALLOWED_EXTENSIONS)
const allowedMimeTypes = new Set<string>(ALLOWED_MIME_TYPES)

export const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_UPLOAD,
    // Bound the multipart envelope itself, not just the files inside it.
    fields: 10,
    parts: MAX_FILES_PER_UPLOAD + 10,
  },
  fileFilter: (_req, file, callback) => {
    const extension = extractExtension(file.originalname)

    if (!extension || !allowedExtensions.has(extension)) {
      callback(
        AppError.unsupportedType(
          `"${file.originalname}": .${extension || "unknown"} files are not supported`,
        ),
      )
      return
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        AppError.unsupportedType(
          `"${file.originalname}": content type ${file.mimetype} is not supported`,
        ),
      )
      return
    }

    // The extension and the declared type must describe the same format. A
    // mismatch here is already a spoofing signal, before the bytes are seen.
    const permittedForExtension = EXTENSION_MIME_MAP[extension]
    if (permittedForExtension && !permittedForExtension.includes(file.mimetype)) {
      callback(
        AppError.unsupportedType(
          `"${file.originalname}": extension .${extension} does not match content type ${file.mimetype}`,
        ),
      )
      return
    }

    callback(null, true)
  },
}).array("files", MAX_FILES_PER_UPLOAD)
