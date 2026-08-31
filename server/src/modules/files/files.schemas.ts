import { FileCategory } from "@prisma/client"
import { z } from "zod"

import {
  ALLOWED_MIME_TYPES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_BYTES,
  MAX_PAGE_SIZE,
  MIN_FILE_SIZE_BYTES,
} from "../../config/constants.js"

/**
 * Validation schemas for the Files module (BE-023..028, docs/18).
 */

export const listFilesQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(100, "Search query too long").optional(),
  category: z.nativeEnum(FileCategory).optional(),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]]).optional(),
  sortBy: z.enum(["createdAt", "size", "originalName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  scope: z.enum(["own", "all"]).default("own"),
})

export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>

export const fileIdParamSchema = z.object({
  id: z.string().trim().min(1, "File ID is required"),
})

export type FileIdParam = z.infer<typeof fileIdParamSchema>

export const downloadQuerySchema = z.object({
  disposition: z.enum(["inline", "attachment"]).default("inline"),
})

export type DownloadQuery = z.infer<typeof downloadQuerySchema>

/**
 * Direct-to-Cloudinary upload (docs/24, Vercel migration).
 *
 * Vercel Functions cap request bodies at 4.5 MB, below the 10 MB per-file
 * limit (ADR-002), so bytes no longer travel through the function. The
 * client instead declares intent to upload — name, MIME, and claimed size —
 * and receives a signature scoped to a server-chosen storage key. The
 * server-side allowlist and size cap are enforced here, before any signature
 * is issued; the claimed size and MIME are re-checked against the real bytes
 * once the file is confirmed (`confirmUploadsSchema` below), so nothing here
 * is trusted on its own.
 */
const declaredFileSchema = z.object({
  originalName: z.string().trim().min(1, "originalName is required").max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]]),
  size: z.coerce
    .number()
    .int()
    .min(MIN_FILE_SIZE_BYTES, "Empty file (0 bytes) is not allowed")
    .max(MAX_FILE_SIZE_BYTES, `File exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB limit`),
})

export const requestUploadSignaturesSchema = z.object({
  files: z
    .array(declaredFileSchema)
    .min(1, "At least one file is required")
    .max(MAX_FILES_PER_UPLOAD, `Cannot upload more than ${MAX_FILES_PER_UPLOAD} files at once`),
})

export type RequestUploadSignaturesInput = z.infer<typeof requestUploadSignaturesSchema>

const confirmedFileSchema = z.object({
  storageKey: z.string().trim().min(1, "storageKey is required"),
  originalName: z.string().trim().min(1, "originalName is required").max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]]),
})

export const confirmUploadsSchema = z.object({
  files: z
    .array(confirmedFileSchema)
    .min(1, "At least one file is required")
    .max(MAX_FILES_PER_UPLOAD, `Cannot confirm more than ${MAX_FILES_PER_UPLOAD} files at once`),
})

export type ConfirmUploadsInput = z.infer<typeof confirmUploadsSchema>
