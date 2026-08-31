"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Archive,
  Download,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  LayoutGrid,
  List,
  X,
  Copy,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { FileTypeBadge } from "@/components/ui/Badge"
import { EmptyState, Skeleton } from "@/components/ui/EmptyState"
import { FileUploadModal } from "@/components/files/FileUploadModal"
import { DeleteFileModal } from "@/components/files/DeleteFileModal"
import { formatBytes, formatDate } from "@/lib/utils"
import api, { getFileDownloadUrl } from "@/lib/axios"
import type { ApiResponse, FileCategory, FileItem } from "@/types/api"
import { useToast } from "@/providers/ToastProvider"

export default function MyFilesPage() {
  const { success } = useToast()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<FileCategory | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"createdAt" | "size" | "originalName">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const limit = 12

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null)

  // React Query to fetch paginated files list
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["files", { page, limit, search, category, sortBy, sortOrder }],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        sortOrder,
      }
      if (search.trim()) params.search = search.trim()
      if (category !== "ALL") params.category = category

      const res = await api.get<ApiResponse<FileItem[]>>("/files", { params })
      return res.data
    },
  })

  const files = data?.data || []
  const meta = data?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 }

  const categories: Array<{ label: string; value: FileCategory | "ALL" }> = [
    { label: "All Files", value: "ALL" },
    { label: "Documents", value: "DOCUMENT" },
    { label: "Images", value: "IMAGE" },
    { label: "Text & Code", value: "TEXT" },
    { label: "Other", value: "OTHER" },
  ]

  const getFileIcon = (mimeType: string, extension: string, sizeClass = "h-5 w-5") => {
    const ext = extension.toLowerCase()
    if (ext === "pdf" || mimeType === "application/pdf") {
      return <FileText className={`${sizeClass} text-red-500 shrink-0`} />
    }
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className={`${sizeClass} text-purple-500 shrink-0`} />
    }
    if (ext === "csv" || ext === "xlsx" || mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className={`${sizeClass} text-emerald-500 shrink-0`} />
    }
    if (ext === "txt" || ext === "md" || ext === "json" || mimeType.startsWith("text/")) {
      return <FileCode className={`${sizeClass} text-amber-500 shrink-0`} />
    }
    return <Archive className={`${sizeClass} text-blue-500 shrink-0`} />
  }

  /**
   * Points the browser directly at the API's download endpoint rather than
   * fetching bytes through axios — see lib/axios.ts `getFileDownloadUrl`.
   * The endpoint 302-redirects to Cloudinary (ADR-044); a credentialed
   * XHR/fetch following that redirect gets blocked by CORS on the far side,
   * but a plain navigation is not subject to CORS at all.
   */
  const handleDownload = (file: FileItem) => {
    const link = document.createElement("a")
    link.href = getFileDownloadUrl(file.id, "attachment")
    link.download = file.originalName
    link.rel = "noopener"
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleCopyLink = (file: FileItem) => {
    const link = `${window.location.origin}/files/${file.id}`
    navigator.clipboard.writeText(link)
    setCopiedId(file.id)
    success("Document URL copied to clipboard", "Link Copied")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Documents & Files
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, filter, download, and inspect extracted text from your vault.
          </p>
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<UploadCloud className="h-4 w-4" />}
          className="shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
        >
          Upload File
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search filename or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 pl-10 pr-9 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value)
                  setPage(1)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  category === cat.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort + View Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                    "createdAt" | "size" | "originalName",
                    "asc" | "desc",
                  ]
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                  setPage(1)
                }}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="size-desc">Largest Size</option>
                <option value="size-asc">Smallest Size</option>
                <option value="originalName-asc">Name (A–Z)</option>
                <option value="originalName-desc">Name (Z–A)</option>
              </select>
            </div>

            {/* View Mode Toggle: Table vs Grid */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Files Content Area */}
      {isLoading ? (
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </Card>
      ) : files.length === 0 ? (
        <Card className="p-8 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <EmptyState
            icon={<FileQuestion className="h-8 w-8 text-blue-500" />}
            title={search ? "No matching files found" : "No files uploaded yet"}
            description={
              search
                ? `No documents matching "${search}". Try searching another keyword.`
                : "Upload your first PDF, DOCX, image, or text file to get started."
            }
            action={
              <Button
                variant="brand"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<UploadCloud className="h-4 w-4" />}
                className="cursor-pointer"
              >
                Upload File Now
              </Button>
            }
            className="my-4"
          />
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {files.map((file) => (
            <Card
              key={file.id}
              className="group flex flex-col justify-between overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 rounded-2xl"
            >
              <div className="p-5">
                {/* Header Icon + Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                    {getFileIcon(file.mimeType, file.extension, "h-6 w-6")}
                  </div>
                  <FileTypeBadge category={file.category} extension={file.extension} />
                </div>

                {/* File Title */}
                <Link
                  href={`/files/${file.id}`}
                  className="block font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  title={file.originalName}
                >
                  {file.originalName}
                </Link>

                {/* Metadata */}
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 dark:text-slate-500">
                  <span>{formatBytes(file.size)}</span>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-2.5">
                <Link href={`/files/${file.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(file)}
                    title="Copy File Link"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === file.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    title="Download File"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileToDelete(file)}
                    title="Delete File"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4">Text Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    {/* Name + Link */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/files/${file.id}`}
                        className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 group-hover:underline cursor-pointer"
                      >
                        {getFileIcon(file.mimeType, file.extension)}
                        <span className="truncate max-w-xs sm:max-w-md">
                          {file.originalName}
                        </span>
                      </Link>
                    </td>

                    {/* Category / Type Badge */}
                    <td className="py-3.5 px-4">
                      <FileTypeBadge
                        category={file.category}
                        extension={file.extension}
                      />
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {formatDate(file.createdAt)}
                    </td>

                    {/* Extraction Status */}
                    <td className="py-3.5 px-4">
                      {file.extractionStatus === "DONE" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Extracted
                        </span>
                      )}
                      {file.extractionStatus === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                      {file.extractionStatus === "SKIPPED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          N/A (Image)
                        </span>
                      )}
                      {file.extractionStatus === "FAILED" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                          Failed
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/files/${file.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Inspect Details & Extracted Text"
                            className="h-8 px-2.5 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          title="Download Asset"
                          className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileToDelete(file)}
                          title="Delete File"
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <Card className="flex items-center justify-between border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {Math.min(page * limit, meta.total)}
            </span>{" "}
            of <span className="font-semibold text-slate-700 dark:text-slate-200">{meta.total}</span> files
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || isPlaceholderData}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-1">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              disabled={page === meta.totalPages || isPlaceholderData}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Upload and Delete Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <DeleteFileModal
        file={fileToDelete}
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
      />
    </div>
  )
}
