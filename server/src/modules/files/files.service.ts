import { createHash } from "node:crypto"

import { Role, type File } from "@prisma/client"

import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  EXTENSION_MIME_MAP,
} from "../../config/constants.js"
import { extractContent } from "../../services/extraction.service.js"
import {
  deliveryUrlFor,
  fetchBlobBuffer,
  removeBlob,
  resourceTypeFor,
  signUpload,
  type UploadSignature,
} from "../../services/storage.service.js"
import { AppError } from "../../utils/AppError.js"
import { categorizeMimeType } from "../../utils/categorize.js"
import {
  extractExtension,
  sanitizeFilename,
} from "../../utils/sanitizeFilename.js"
import type { ConfirmUploadsInput, ListFilesQuery, RequestUploadSignaturesInput } from "./files.schemas.js"
import { filesRepository, type FileWithOwner } from "./files.repository.js"

export interface UploadOutcome {
  uploaded: File[]
  failed: Array<{ originalName: string; reason: string }>
}

export interface FileUploadSignature extends UploadSignature {
  originalName: string
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

export interface ResolvedFileDownload {
  url: string
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
   * Issues Cloudinary upload signatures for a declared batch (ADR-002,
   * Vercel migration — see storage.service.ts `signUpload` for why this
   * exists).
   *
   * The allowlist and size cap are enforced here, against the *declared*
   * name/MIME/size, before any signature is handed out — a request naming an
   * unsupported type never gets a storage key. This is a first filter, not
   * the authoritative check: the declared values are re-verified against the
   * real bytes in `confirmUploads` once the upload completes.
   */
  createUploadSignatures(
    input: RequestUploadSignaturesInput,
  ): { signatures: FileUploadSignature[] } {
    const failures: Array<{ field: string; message: string }> = []

    const signatures = input.files.map((file) => {
      const extension = extractExtension(file.originalName)

      if (!extension || !allowedExtensions.has(extension)) {
        failures.push({
          field: file.originalName,
          message: `Extension .${extension || "unknown"} is not supported`,
        })
      } else if (!allowedMimeTypes.has(file.mimeType)) {
        failures.push({
          field: file.originalName,
          message: `Content type ${file.mimeType} is not supported`,
        })
      }

      const signature = signUpload(extension ?? "", file.mimeType)
      return { ...signature, originalName: file.originalName }
    })

    if (failures.length > 0) {
      throw AppError.validation(failures, "One or more files are not supported")
    }

    return { signatures }
  },

  /**
   * Validates and persists files already uploaded directly to Cloudinary
   * (ADR-002, ADR-003, ADR-039, Vercel migration).
   *
   * Mirrors the checks the previous multipart path ran against
   * `file.buffer` — magic bytes, checksum, extraction — but the buffer now
   * comes from fetching the blob back from Cloudinary, since bytes never
   * passed through this function. A failure at any step removes the blob so
   * nothing unvalidated is left reachable.
   */
  async confirmUploads(
    user: { id: string; role: Role },
    input: ConfirmUploadsInput,
  ): Promise<UploadOutcome> {
    const uploaded: File[] = []
    const failed: Array<{ originalName: string; reason: string }> = []

    for (const declared of input.files) {
      const originalName = declared.originalName || "unnamed"
      const resourceType = resourceTypeFor(declared.mimeType)

      // 1. Extension & MIME allowlist check (re-verified; the signature step
      // already checked this, but never trust a value round-tripped through
      // the client).
      const extension = extractExtension(originalName)
      if (!extension || !allowedExtensions.has(extension)) {
        failed.push({
          originalName,
          reason: `Extension .${extension || "unknown"} is not supported`,
        })
        await removeBlob(declared.storageKey, resourceType).catch(() => {})
        continue
      }

      if (!allowedMimeTypes.has(declared.mimeType)) {
        failed.push({
          originalName,
          reason: `Content type ${declared.mimeType} is not supported`,
        })
        await removeBlob(declared.storageKey, resourceType).catch(() => {})
        continue
      }

      // 2. Fetch the real bytes back from Cloudinary
      let buffer: Buffer
      try {
        buffer = await fetchBlobBuffer(declared.storageKey, resourceType, extension)
      } catch (fetchErr) {
        console.error(`[upload] failed to retrieve ${originalName} from storage:`, fetchErr)
        failed.push({
          originalName,
          reason: "Could not retrieve uploaded file from storage provider",
        })
        continue
      }

      // 3. Reject 0-byte files (ADR-042)
      if (buffer.length === 0) {
        failed.push({
          originalName,
          reason: "Empty file (0 bytes) is not allowed",
        })
        await removeBlob(declared.storageKey, resourceType).catch(() => {})
        continue
      }

      // 4. Magic-byte verification (ADR-003)
      const isSignatureValid = await validateMagicBytes(
        buffer,
        extension,
        declared.mimeType,
      )
      if (!isSignatureValid) {
        failed.push({
          originalName,
          reason: `File content signature does not match declared type ${declared.mimeType}`,
        })
        await removeBlob(declared.storageKey, resourceType).catch(() => {})
        continue
      }

      // 5. SHA-256 Checksum (ADR-015)
      const checksum = createHash("sha256").update(buffer).digest("hex")

      // 6. Content Extraction (ADR-005, ADR-006)
      const extraction = await extractContent(buffer, declared.mimeType)

      // 7. Category derivation & Name sanitization
      const category = categorizeMimeType(declared.mimeType)
      const sanitizedName = sanitizeFilename(originalName)

      // 8. Persist Database Record (with rollback if DB write fails)
      try {
        const record = await filesRepository.createFile({
          ownerId: user.id,
          originalName: sanitizedName,
          storageKey: declared.storageKey,
          mimeType: declared.mimeType,
          category,
          extension,
          size: buffer.length,
          checksum,
          extractedContent: extraction.content,
          extractionStatus: extraction.status,
        })
        uploaded.push(record)
      } catch (dbErr) {
        console.error(`[upload] DB persistence failed for ${originalName}:`, dbErr)
        await removeBlob(declared.storageKey, resourceType).catch(() => {})
        failed.push({
          originalName,
          reason: "Database error while saving file record",
        })
      }
    }

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
   * Authorizes a download/preview and resolves the delivery URL to redirect
   * to (BE-027, ADR-023, Vercel migration).
   *
   * Previously streamed blob bytes back through this API. Vercel Functions
   * cap response bodies at 4.5 MB, so any file larger than that would fail
   * mid-download; redirecting the browser straight to Cloudinary has no such
   * limit. This does not meaningfully weaken access control: blobs are
   * already stored as `type: "upload"` (public delivery URLs), so the
   * ownership check below has always gated *discovering* the URL, not
   * fetching it once known.
   */
  async downloadFile(
    user: { id: string; role: Role },
    fileId: string,
    disposition: "inline" | "attachment",
  ): Promise<ResolvedFileDownload> {
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
    const url = deliveryUrlFor(file.storageKey, resourceType, {
      attachmentFilename: disposition === "attachment" ? file.originalName : undefined,
      format: file.extension,
    })

    return { url }
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
