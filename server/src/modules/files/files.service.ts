import { createHash } from "node:crypto"
import { Readable } from "node:stream"

import { Role, type File } from "@prisma/client"

import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  EXTENSION_MIME_MAP,
} from "../../config/constants.js"
import { extractContent } from "../../services/extraction.service.js"
import {
  removeBlob,
  resourceTypeFor,
  streamBlob,
  uploadBlob,
} from "../../services/storage.service.js"
import { AppError } from "../../utils/AppError.js"
import { categorizeMimeType } from "../../utils/categorize.js"
import {
  extractExtension,
  sanitizeFilename,
} from "../../utils/sanitizeFilename.js"
import type { ListFilesQuery } from "./files.schemas.js"
import { filesRepository, type FileWithOwner } from "./files.repository.js"

export interface UploadOutcome {
  uploaded: File[]
  failed: Array<{ originalName: string; reason: string }>
}

export interface PaginatedFilesResponse {
  files: FileWithOwner[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StreamedFileDownload {
  stream: Readable
  mimeType: string
  originalName: string
  size: number
}

const allowedExtensions = new Set<string>(ALLOWED_EXTENSIONS)
const allowedMimeTypes = new Set<string>(ALLOWED_MIME_TYPES)

/**
 * Validates magic-byte signature of buffer against declared format (ADR-003).
 */
async function validateMagicBytes(
  buffer: Buffer,
  extension: string,
  declaredMime: string,
): Promise<boolean> {
  // Plain-text and JSON formats have no reliable binary magic bytes.
  // Their validity is confirmed via UTF-8 decoding and text parsing.
  if (
    declaredMime.startsWith("text/") ||
    declaredMime === "application/json" ||
    declaredMime === "application/csv" ||
    extension === "txt" ||
    extension === "md" ||
    extension === "csv" ||
    extension === "json"
  ) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer)
    return !text.includes("\uFFFD")
  }

  try {
    const fileTypeModule = await import("file-type")
    const detector =
      fileTypeModule.fileTypeFromBuffer ??
      (fileTypeModule as unknown as { default?: { fromBuffer?: (b: Buffer) => Promise<{ ext: string; mime: string } | undefined> } }).default?.fromBuffer

    if (!detector) return true

    const detected = await detector(buffer)
    if (!detected) {
      // If binary detector cannot identify, but extension/MIME are valid and non-executable
      return false
    }

    const permittedMimes = EXTENSION_MIME_MAP[extension] ?? []
    return (
      allowedMimeTypes.has(detected.mime) &&
      (permittedMimes.includes(detected.mime) || detected.mime === declaredMime)
    )
  } catch (err) {
    console.error("[upload] magic-byte check error:", err)
    return false
  }
}

export const filesService = {
  /**
   * Processes multipart upload batch (BE-023, ADR-002, ADR-003, ADR-039).
   */
  async uploadFiles(
    user: { id: string; role: Role },
    files: Express.Multer.File[],
  ): Promise<UploadOutcome> {
    if (!files || files.length === 0) {
      throw AppError.badRequest("ERR_VALIDATION", "No files uploaded")
    }

    const uploaded: File[] = []
    const failed: Array<{ originalName: string; reason: string }> = []

    for (const file of files) {
      const originalName = file.originalname || "unnamed"

      // 1. Reject 0-byte files (ADR-042)
      if (!file.size || file.size === 0) {
        failed.push({
          originalName,
          reason: "Empty file (0 bytes) is not allowed",
        })
        continue
      }

      // 2. Extension & MIME allowlist check
      const extension = extractExtension(originalName)
      if (!extension || !allowedExtensions.has(extension)) {
        failed.push({
          originalName,
          reason: `Extension .${extension || "unknown"} is not supported`,
        })
        continue
      }

      if (!allowedMimeTypes.has(file.mimetype)) {
        failed.push({
          originalName,
          reason: `Content type ${file.mimetype} is not supported`,
        })
        continue
      }

      // 3. Magic-byte verification (ADR-003)
      const isSignatureValid = await validateMagicBytes(
        file.buffer,
        extension,
        file.mimetype,
      )
      if (!isSignatureValid) {
        failed.push({
          originalName,
          reason: `File content signature does not match declared type ${file.mimetype}`,
        })
        continue
      }

      // 4. SHA-256 Checksum (ADR-015)
      const checksum = createHash("sha256").update(file.buffer).digest("hex")

      // 5. Content Extraction (ADR-005, ADR-006)
      const extraction = await extractContent(file.buffer, file.mimetype)

      // 6. Category derivation & Name sanitization
      const category = categorizeMimeType(file.mimetype)
      const sanitizedName = sanitizeFilename(originalName)

      // 7. Store Blob in Cloudinary (ADR-039)
      let storedBlob
      try {
        storedBlob = await uploadBlob(file.buffer, extension, file.mimetype)
      } catch (uploadErr) {
        console.error(`[upload] Cloudinary upload failed for ${originalName}:`, uploadErr)
        failed.push({
          originalName,
          reason: "Failed to persist file in storage provider",
        })
        continue
      }

      // 8. Persist Database Record (with rollback if DB write fails)
      try {
        const record = await filesRepository.createFile({
          ownerId: user.id,
          originalName: sanitizedName,
          storageKey: storedBlob.storageKey,
          mimeType: file.mimetype,
          category,
          extension,
          size: file.size,
          checksum,
          extractedContent: extraction.content,
          extractionStatus: extraction.status,
        })
        uploaded.push(record)
      } catch (dbErr) {
        console.error(`[upload] DB persistence failed for ${originalName}:`, dbErr)
        // Clean up orphaned storage blob
        await removeBlob(storedBlob.storageKey, storedBlob.resourceType).catch(() => {})
        failed.push({
          originalName,
          reason: "Database error while saving file record",
        })
      }
    }

    // If all files in the batch failed validation, respond with an error
    if (uploaded.length === 0 && failed.length > 0) {
      throw new AppError(
        "ERR_UPLOAD_FAILED",
        400,
        "All uploaded files failed validation",
        failed.map((f) => ({ field: f.originalName, message: f.reason })),
      )
    }

    return { uploaded, failed }
  },

  /**
   * Lists files with pagination, search, filter, and sorting (BE-024, BE-028).
   */
  async listFiles(
    user: { id: string; role: Role },
    query: ListFilesQuery,
  ): Promise<PaginatedFilesResponse> {
    const { page, limit, search, category, mimeType, sortBy, sortOrder, scope } = query

    // Only administrators can view all files across the system via scope=all
    const isAdminScope = user.role === Role.ADMIN && scope === "all"
    const ownerId = isAdminScope ? undefined : user.id

    const skip = (page - 1) * limit
    const take = limit

    const { items, total } = await filesRepository.findFiles({
      ownerId,
      search,
      category,
      mimeType,
      sortBy,
      sortOrder,
      skip,
      take,
    })

    const totalPages = Math.ceil(total / limit) || 1

    return {
      files: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  },

  /**
   * Retrieves single file details with ownership enforcement (BE-025, FILE-015).
   */
  async getFileDetails(
    user: { id: string; role: Role },
    fileId: string,
  ): Promise<FileWithOwner> {
    const file = await filesRepository.findFileById(fileId)

    if (!file) {
      throw AppError.notFound("ERR_FILE_NOT_FOUND", "File not found")
    }

    // Authoritative ownership check
    if (user.role !== Role.ADMIN && file.ownerId !== user.id) {
      throw AppError.forbidden(
        "You do not have permission to access this file",
        "ERR_FORBIDDEN",
      )
    }

    return file
  },

  /**
   * Streams file content for authenticated download/preview (BE-027, ADR-023).
   */
  async downloadFile(
    user: { id: string; role: Role },
    fileId: string,
  ): Promise<StreamedFileDownload> {
    const file = await filesRepository.findFileById(fileId)

    if (!file) {
      throw AppError.notFound("ERR_FILE_NOT_FOUND", "File not found")
    }

    if (user.role !== Role.ADMIN && file.ownerId !== user.id) {
      throw AppError.forbidden(
        "You do not have permission to access this file",
        "ERR_FORBIDDEN",
      )
    }

    const resourceType = resourceTypeFor(file.mimeType)
    const { stream } = await streamBlob(file.storageKey, resourceType)

    return {
      stream,
      mimeType: file.mimeType,
      originalName: file.originalName,
      size: file.size,
    }
  },

  /**
   * Deletes a file record and removes its physical storage blob (BE-026, ADR-013).
   */
  async deleteFile(
    user: { id: string; role: Role },
    fileId: string,
  ): Promise<{ id: string }> {
    const file = await filesRepository.findFileById(fileId)

    if (!file) {
      throw AppError.notFound("ERR_FILE_NOT_FOUND", "File not found")
    }

    if (user.role !== Role.ADMIN && file.ownerId !== user.id) {
      throw AppError.forbidden(
        "You do not have permission to delete this file",
        "ERR_FORBIDDEN",
      )
    }

    // Delete database row first
    await filesRepository.deleteFile(fileId)

    // Remove blob from Cloudinary
    const resourceType = resourceTypeFor(file.mimeType)
    await removeBlob(file.storageKey, resourceType).catch((err) => {
      console.error(`[delete] failed to remove Cloudinary blob ${file.storageKey}:`, err)
    })

    return { id: file.id }
  },
}
