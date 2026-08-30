import { FileCategory } from "@prisma/client"

import { prisma } from "../../config/prisma.js"

export interface CategoryStat {
  count: number
  totalBytes: number
}

export interface UserStatsResult {
  totalFiles: number
  totalStorageBytes: number
  storageLimitBytes: number
  categories: Record<FileCategory, CategoryStat>
  recentFiles: Array<{
    id: string
    originalName: string
    category: FileCategory
    size: number
    mimeType: string
    createdAt: Date
  }>
}

export interface TrendDay {
  date: string // YYYY-MM-DD
  count: number
  totalBytes: number
}

export interface AdminStatsResult {
  totalUsers: number
  totalFiles: number
  totalStorageBytes: number
  categories: Record<FileCategory, CategoryStat>
  uploadTrend: TrendDay[]
}

const DEFAULT_USER_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024 // 500 MB per user (docs/21)

export const statsService = {
  /**
   * Computes user-level metrics for personal dashboard (STAT-001, STAT-002).
   */
  async getUserStats(userId: string): Promise<UserStatsResult> {
    const [totalFiles, storageAggregate, rawCategoryStats, recentFiles] =
      await Promise.all([
        prisma.file.count({
          where: { ownerId: userId },
        }),
        prisma.file.aggregate({
          where: { ownerId: userId },
          _sum: { size: true },
        }),
        prisma.file.groupBy({
          by: ["category"],
          where: { ownerId: userId },
          _count: { id: true },
          _sum: { size: true },
        }),
        prisma.file.findMany({
          where: { ownerId: userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            originalName: true,
            category: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        }),
      ])

    // Initialize full category dictionary to ensure consistent chart keys
    const categories: Record<FileCategory, CategoryStat> = {
      [FileCategory.DOCUMENT]: { count: 0, totalBytes: 0 },
      [FileCategory.IMAGE]: { count: 0, totalBytes: 0 },
      [FileCategory.TEXT]: { count: 0, totalBytes: 0 },
      [FileCategory.OTHER]: { count: 0, totalBytes: 0 },
    }

    for (const group of rawCategoryStats) {
      categories[group.category] = {
        count: group._count.id,
        totalBytes: group._sum.size ?? 0,
      }
    }

    return {
      totalFiles,
      totalStorageBytes: storageAggregate._sum.size ?? 0,
      storageLimitBytes: DEFAULT_USER_STORAGE_LIMIT_BYTES,
      categories,
      recentFiles,
    }
  },

  /**
   * Computes system-wide metrics and 30-day upload trend for admin dashboard (STAT-003..005).
   */
  async getAdminStats(): Promise<AdminStatsResult> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalFiles,
      storageAggregate,
      rawCategoryStats,
      recentUploads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.file.count(),
      prisma.file.aggregate({
        _sum: { size: true },
      }),
      prisma.file.groupBy({
        by: ["category"],
        _count: { id: true },
        _sum: { size: true },
      }),
      prisma.file.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          size: true,
          createdAt: true,
        },
      }),
    ])

    // Initialize category breakdown
    const categories: Record<FileCategory, CategoryStat> = {
      [FileCategory.DOCUMENT]: { count: 0, totalBytes: 0 },
      [FileCategory.IMAGE]: { count: 0, totalBytes: 0 },
      [FileCategory.TEXT]: { count: 0, totalBytes: 0 },
      [FileCategory.OTHER]: { count: 0, totalBytes: 0 },
    }

    for (const group of rawCategoryStats) {
      categories[group.category] = {
        count: group._count.id,
        totalBytes: group._sum.size ?? 0,
      }
    }

    // Build contiguous 30-day bucket array
    const trendMap = new Map<string, { count: number; totalBytes: number }>()

    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - i)
      const key = d.toISOString().slice(0, 10)
      trendMap.set(key, { count: 0, totalBytes: 0 })
    }

    for (const upload of recentUploads) {
      const dayKey = upload.createdAt.toISOString().slice(0, 10)
      const existing = trendMap.get(dayKey)
      if (existing) {
        existing.count += 1
        existing.totalBytes += upload.size
      }
    }

    const uploadTrend: TrendDay[] = Array.from(trendMap.entries()).map(
      ([date, stat]) => ({
        date,
        count: stat.count,
        totalBytes: stat.totalBytes,
      }),
    )

    return {
      totalUsers,
      totalFiles,
      totalStorageBytes: storageAggregate._sum.size ?? 0,
      categories,
      uploadTrend,
    }
  },
}
