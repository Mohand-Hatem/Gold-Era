import { Role, type User } from "@prisma/client"

import {
  removeBlobs,
  resourceTypeFor,
} from "../../services/storage.service.js"
import { AppError } from "../../utils/AppError.js"
import type { ListUsersQuery } from "./users.schemas.js"
import {
  usersRepository,
  type PaginatedUsersResult,
  type UserSummary,
} from "./users.repository.js"

export interface PaginatedUsersResponse {
  users: UserSummary[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const usersService = {
  /**
   * Lists users with search, role filtering, and pagination (BE-029).
   */
  async listUsers(query: ListUsersQuery): Promise<PaginatedUsersResponse> {
    const { page, limit, search, role, sortBy, sortOrder } = query

    const skip = (page - 1) * limit
    const take = limit

    const { items, total }: PaginatedUsersResult =
      await usersRepository.findUsers({
        search,
        role,
        sortBy,
        sortOrder,
        skip,
        take,
      })

    const totalPages = Math.ceil(total / limit) || 1

    return {
      users: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  },

  /**
   * Updates user role with self-demotion prevention (BE-030, ADR-020).
   */
  async updateUserRole(
    adminUser: { id: string; role: Role },
    targetUserId: string,
    newRole: Role,
  ): Promise<Omit<User, "password">> {
    // 1. Guard against self-demotion (ADR-020, ADMIN-004)
    if (adminUser.id === targetUserId && newRole !== Role.ADMIN) {
      throw AppError.forbidden(
        "You cannot demote your own administrator account",
        "ERR_SELF_DEMOTE",
      )
    }

    // 2. Ensure target user exists
    const existing = await usersRepository.findUserById(targetUserId)
    if (!existing) {
      throw AppError.notFound("ERR_USER_NOT_FOUND", "User not found")
    }

    // 3. Apply role update & token version bump
    return usersRepository.updateUserRole(targetUserId, newRole)
  },

  /**
   * Deletes a user with self-deletion prevention and cascade blob cleanup (BE-031, ADR-013, ADR-020).
   */
  async deleteUser(
    adminUser: { id: string; role: Role },
    targetUserId: string,
  ): Promise<{ id: string }> {
    // 1. Guard against self-deletion (ADR-020, ADMIN-005)
    if (adminUser.id === targetUserId) {
      throw AppError.forbidden(
        "You cannot delete your own administrator account",
        "ERR_SELF_DELETE",
      )
    }

    // 2. Ensure target user exists
    const existing = await usersRepository.findUserById(targetUserId)
    if (!existing) {
      throw AppError.notFound("ERR_USER_NOT_FOUND", "User not found")
    }

    // 3. Find all storage keys to clean up from Cloudinary
    const userFiles =
      await usersRepository.findUserFilesForDeletion(targetUserId)

    // 4. Delete user record in PostgreSQL (cascades to DB File & VerificationCode records)
    await usersRepository.deleteUser(targetUserId)

    // 5. Clean up remote storage blobs
    if (userFiles.length > 0) {
      const blobsToRemove = userFiles.map((file) => ({
        storageKey: file.storageKey,
        resourceType: resourceTypeFor(file.mimeType),
      }))

      await removeBlobs(blobsToRemove).catch((err) => {
        console.error(
          `[users] failed removing blobs for deleted user ${targetUserId}:`,
          err,
        )
      })
    }

    return { id: targetUserId }
  },
}
