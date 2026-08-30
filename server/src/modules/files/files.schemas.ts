import { FileCategory } from "@prisma/client"
import { z } from "zod"

import {
  ALLOWED_MIME_TYPES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
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
