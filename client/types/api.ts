export type Role = "USER" | "ADMIN"
export type ExtractionStatus = "PENDING" | "DONE" | "SKIPPED" | "FAILED"
export type FileCategory = "DOCUMENT" | "IMAGE" | "TEXT" | "OTHER"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isEmailVerified: boolean
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface UserWithFileCount extends User {
  _count?: {
    files: number
  }
}

export interface FileItem {
  id: string
  ownerId: string
  originalName: string
  storageKey: string
  mimeType: string
  category: FileCategory
  extension: string
  size: number
  checksum: string
  extractedContent: string | null
  extractionStatus: ExtractionStatus
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    name: string
    email: string
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

export interface CategoryStat {
  count: number
  totalBytes: number
}

export interface UserDashboardStats {
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
    createdAt: string
  }>
}

export interface TrendDay {
  date: string // YYYY-MM-DD
  count: number
  totalBytes: number
}

export interface AdminDashboardStats {
  totalUsers: number
  totalFiles: number
  totalStorageBytes: number
  categories: Record<FileCategory, CategoryStat>
  uploadTrend: TrendDay[]
}
