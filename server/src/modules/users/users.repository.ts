import type { Prisma, Role, User } from "@prisma/client"

import { prisma } from "../../config/prisma.js"

export interface FindUsersFilters {
  search?: string
  role?: Role
  sortBy?: "createdAt" | "name" | "email"
  sortOrder?: "asc" | "desc"
  skip: number
  take: number
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: Role
  isEmailVerified: boolean
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    files: number
  }
}

export interface PaginatedUsersResult {
  items: UserSummary[]
  total: number
}

/**
 * Users management data access repository (BE-029..031, docs/09, docs/22).
 */
export const usersRepository = {
  /**
   * Retrieves paginated users list with search, role filter, and file counts.
   */
  async findUsers(filters: FindUsersFilters): Promise<PaginatedUsersResult> {
    const {
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
      skip,
      take,
    } = filters

    const where: Prisma.UserWhereInput = {}

    if (role) {
      where.role = role
    }

    if (search && search.length > 0) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              files: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return { items, total }
  },

  /**
   * Finds user by primary key ID.
   */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  /**
   * Updates user role and increments tokenVersion to revoke active sessions (AUTH-013, ADR-007).
   */
  async updateUserRole(
    id: string,
    role: Role,
  ): Promise<Omit<User, "password">> {
    return prisma.user.update({
      where: { id },
      data: {
        role,
        tokenVersion: {
          increment: 1,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        avatarUrl: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  /**
   * Retrieves all file storage keys for a given user prior to cascade deletion.
   */
  async findUserFilesForDeletion(
    userId: string,
  ): Promise<Array<{ storageKey: string; mimeType: string }>> {
    return prisma.file.findMany({
      where: { ownerId: userId },
      select: {
        storageKey: true,
        mimeType: true,
      },
    })
  },

  /**
   * Deletes a user row.
   * Cascade deletes linked files and verification codes via Prisma/PostgreSQL foreign keys.
   */
  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    })
  },
}
