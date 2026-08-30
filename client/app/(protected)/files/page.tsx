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
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Badge, FileTypeBadge } from "@/components/ui/Badge"
import { EmptyState, Skeleton } from "@/components/ui/EmptyState"
import { FileUploadModal } from "@/components/files/FileUploadModal"
import { DeleteFileModal } from "@/components/files/DeleteFileModal"
import { formatBytes, formatDate } from "@/lib/utils"
import api from "@/lib/axios"
import type { ApiResponse, FileCategory, FileItem } from "@/types/api"

export default function MyFilesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<FileCategory | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"createdAt" | "size" | "originalName">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const limit = 10

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
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 }

  const categories: Array<{ label: string; value: FileCategory | "ALL" }> = [
    { label: "All Files", value: "ALL" },
    { label: "Documents", value: "DOCUMENT" },
    { label: "Images", value: "IMAGE" },
    { label: "Text & Code", value: "TEXT" },
    { label: "Other", value: "OTHER" },
  ]

  const getFileIcon = (mimeType: string, extension: string) => {
    const ext = extension.toLowerCase()
    if (ext === "pdf" || mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    }
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-purple-500 shrink-0" />
    }
    if (ext === "csv" || ext === "xlsx" || mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
    }
    if (ext === "txt" || ext === "md" || ext === "json" || mimeType.startsWith("text/")) {
      return <FileCode className="h-5 w-5 text-amber-500 shrink-0" />
    }
    return <Archive className="h-5 w-5 text-blue-500 shrink-0" />
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await api.get(`/files/${file.id}/download?disposition=attachment`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", file.originalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 10000)
    } catch (err) {
      console.error("Download failed:", err)
    }
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
            Search, filter, download and inspect extracted text from your vault.
          </p>
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<UploadCloud className="h-4 w-4" />}
          className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          Upload File
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search filename or content..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value)
                  setPage(1)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === cat.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
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
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="size-desc">Largest Size</option>
              <option value="size-asc">Smallest Size</option>
              <option value="originalName-asc">Name (A–Z)</option>
              <option value="originalName-desc">Name (Z–A)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Files Table Card */}
      <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : files.length === 0 ? (
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
              >
                Upload File Now
              </Button>
            }
            className="my-8"
          />
        ) : (
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
                        className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 group-hover:underline"
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
                            className="h-8 px-2.5"
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
                          className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFileToDelete(file)}
                          title="Delete File"
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
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
        )}

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-4 py-3 sm:px-6">
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
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

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
