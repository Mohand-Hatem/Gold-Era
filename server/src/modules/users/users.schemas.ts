import { Role } from "@prisma/client"
import { z } from "zod"

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../../config/constants.js"

/**
 * Validation schemas for Users administration module (BE-029..031, docs/18, docs/22).
 */

export const listUsersQuerySchema = z.object({
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
  role: z.nativeEnum(Role).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, "User ID is required"),
})

export type UserIdParam = z.infer<typeof userIdParamSchema>

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role, {
    message: "Role must be either USER or ADMIN",
  }),
})

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
