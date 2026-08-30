import type { File, FileCategory, Prisma } from "@prisma/client"

import { prisma } from "../../config/prisma.js"

export interface FindFilesFilters {
  ownerId?: string
  search?: string
  category?: FileCategory
  mimeType?: string
  sortBy?: "createdAt" | "size" | "originalName"
  sortOrder?: "asc" | "desc"
  skip: number
  take: number
}

export interface FileWithOwner extends File {
  owner: {
    id: string
    name: string
    email: string
  }
}

export interface PaginatedFilesResult {
  items: FileWithOwner[]
  total: number
}

/**
 * Files data access repository (BE-023..028, docs/09, docs/15).
 * Encapsulates direct database operations on the `File` model.
 */
export const filesRepository = {
  /**
   * Persists a new File row in PostgreSQL.
   */
  async createFile(data: Prisma.FileUncheckedCreateInput): Promise<File> {
    return prisma.file.create({
      data,
    })
  },

  /**
   * Retrieves a single File by ID including basic owner details.
   */
  async findFileById(id: string): Promise<FileWithOwner | null> {
    return prisma.file.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  /**
   * Queries files with dynamic filtering, case-insensitive keyword search,
   * whitelisted sorting, and offset pagination.
   */
  async findFiles(filters: FindFilesFilters): Promise<PaginatedFilesResult> {
    const {
      ownerId,
      search,
      category,
      mimeType,
      sortBy = "createdAt",
      sortOrder = "desc",
      skip,
      take,
    } = filters

    const where: Prisma.FileWhereInput = {}

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (category) {
      where.category = category
    }

    if (mimeType) {
      where.mimeType = mimeType
    }

    if (search && search.length > 0) {
      where.OR = [
        {
          originalName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          extractedContent: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.file.count({ where }),
    ])

    return { items, total }
  },

  /**
   * Deletes a File row by its primary key ID.
   */
  async deleteFile(id: string): Promise<File> {
    return prisma.file.delete({
      where: { id },
    })
  },
}
