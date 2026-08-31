"use client"

import React, { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import rawAxios from "axios"
import {
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Loader2,
} from "lucide-react"

import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { ProgressBar } from "../ui/ProgressBar"
import { formatBytes } from "../../lib/utils"
import api, { getApiErrorMessage } from "../../lib/axios"
import type { ApiResponse, FileItem } from "../../types/api"
import { useToast } from "../../providers/ToastProvider"

export interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const ALLOWED_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "json",
  "pdf",
  "docx",
  "png",
  "jpeg",
  "jpg",
  "webp",
]

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB per file (ADR-002)
const MAX_FILES_PER_BATCH = 5 // (ADR-002)

interface UploadSignature {
  storageKey: string
  resourceType: "image" | "raw"
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  format?: string
  uploadUrl: string
  originalName: string
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const resetState = () => {
    setSelectedFiles([])
    setIsDragging(false)
    setIsUploading(false)
    setUploadProgress(0)
  }

  const handleClose = () => {
    if (isUploading) return
    resetState()
    onClose()
  }

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    const fileList = Array.from(newFiles)
    const valid: File[] = []

    for (const file of fileList) {
      // Check batch limit
      if (selectedFiles.length + valid.length >= MAX_FILES_PER_BATCH) {
        error(`Maximum ${MAX_FILES_PER_BATCH} files allowed per upload batch`, "Batch Limit Exceeded")
        break
      }

      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        error(`"${file.name}" exceeds the 10 MB limit (${formatBytes(file.size)})`, "File Too Large")
        continue
      }

      if (file.size === 0) {
        error(`"${file.name}" is empty (0 bytes)`, "Invalid File")
        continue
      }

      // Check extension
      const ext = file.name.split(".").pop()?.toLowerCase() || ""
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        error(`.${ext || "unknown"} is not a supported file type`, "Unsupported Format")
        continue
      }

      // Avoid duplicates
      if (selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
        continue
      }

      valid.push(file)
    }

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid])
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files)
    }
  }, [selectedFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files)
      e.target.value = ""
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Uploads directly to Cloudinary rather than through our own API (docs/24,
   * Vercel migration): the API now runs as a Vercel Function, which caps
   * request bodies at 4.5 MB — below the 10 MB per-file limit this modal
   * already enforces above. The flow becomes three steps instead of one:
   *
   *   1. POST /files/upload-signature — declare what we intend to upload;
   *      get back a signed, single-use Cloudinary upload slot per file.
   *   2. PUT the bytes straight to Cloudinary using that signature. Never
   *      touches our API, so the 4.5 MB cap doesn't apply.
   *   3. POST /files/confirm — the server fetches each blob back from
   *      Cloudinary, validates the real bytes (magic-byte check, checksum,
   *      extraction), and only then creates the database record.
   *
   * Each file's own upload progress is tracked separately and averaged, so
   * the bar still reflects real progress across the batch rather than
   * jumping in three big steps.
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return

    setIsUploading(true)
    setUploadProgress(0)

    const filesToUpload = selectedFiles

    try {
      // Step 1 — request a signature per file.
      const signatureRes = await api.post<ApiResponse<{ signatures: UploadSignature[] }>>(
        "/files/upload-signature",
        {
          files: filesToUpload.map((file) => ({
            originalName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
          })),
        },
      )
      const signatures = signatureRes.data.data.signatures

      // Step 2 — upload each file straight to Cloudinary in parallel,
      // tracking per-file progress for a combined percentage.
      const progressByFile = new Array<number>(filesToUpload.length).fill(0)
      const reportProgress = () => {
        const total = progressByFile.reduce((sum, pct) => sum + pct, 0)
        // Reserve the last 15% for the confirm step below.
        setUploadProgress(Math.round((total / filesToUpload.length) * 0.85))
      }

      const cloudinaryOutcomes = await Promise.allSettled(
        filesToUpload.map(async (file, index) => {
          const sig = signatures[index]
          if (!sig) throw new Error("No upload signature returned for this file")

          const form = new FormData()
          form.append("file", file)
          form.append("api_key", sig.apiKey)
          form.append("timestamp", String(sig.timestamp))
          form.append("public_id", sig.storageKey)
          form.append("type", "upload")
          if (sig.format) form.append("format", sig.format)
          form.append("signature", sig.signature)

          // A bare axios instance: this goes to api.cloudinary.com, not our
          // API, so none of our baseURL/credentials/JSON defaults apply.
          await rawAxios.post(sig.uploadUrl, form, {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                progressByFile[index] = (progressEvent.loaded / progressEvent.total) * 100
                reportProgress()
              }
            },
          })

          return { storageKey: sig.storageKey, originalName: file.name, mimeType: file.type || "application/octet-stream" }
        }),
      )

      const confirmable: Array<{ storageKey: string; originalName: string; mimeType: string }> = []
      const clientFailures: Array<{ originalName: string; reason: string }> = []

      cloudinaryOutcomes.forEach((outcome, index) => {
        if (outcome.status === "fulfilled") {
          confirmable.push(outcome.value)
        } else {
          clientFailures.push({
            originalName: filesToUpload[index]?.name ?? "unknown file",
            reason: "Upload to storage provider failed",
          })
        }
      })

      setUploadProgress(90)

      // Step 3 — hand the server the storage keys it needs to validate the
      // real bytes and persist the records.
      let uploaded: FileItem[] = []
      let serverFailures: Array<{ originalName: string; reason: string }> = []

      if (confirmable.length > 0) {
        const confirmRes = await api.post<
          ApiResponse<{ uploaded: FileItem[]; failed: Array<{ originalName: string; reason: string }> }>
        >("/files/confirm", { files: confirmable })
        uploaded = confirmRes.data.data.uploaded
        serverFailures = confirmRes.data.data.failed ?? []
      }

      setUploadProgress(100)

      const failed = [...clientFailures, ...serverFailures]

      if (uploaded.length > 0) {
        success(
          `Successfully uploaded ${uploaded.length} file${uploaded.length > 1 ? "s" : ""}`,
          "Upload Complete",
        )
        queryClient.invalidateQueries({ queryKey: ["files"] })
        queryClient.invalidateQueries({ queryKey: ["stats"] })
      }

      if (failed.length > 0) {
        failed.forEach((f) => {
          error(`${f.originalName}: ${f.reason}`, "Upload Warning")
        })
      }

      handleClose()
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Upload Failed")
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || ""
    if (ext === "pdf") return <FileText className="h-5 w-5 text-red-500 shrink-0" />
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return <ImageIcon className="h-5 w-5 text-purple-500 shrink-0" />
    if (["csv", "xlsx"].includes(ext)) return <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
    if (["txt", "md", "json"].includes(ext)) return <FileCode className="h-5 w-5 text-amber-500 shrink-0" />
    return <FileText className="h-5 w-5 text-blue-500 shrink-0" />
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Documents & Files"
      description="Add up to 5 files (max 10 MB per file) to extract text and store securely in your vault."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedFiles.length} of {MAX_FILES_PER_BATCH} files selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              isLoading={isUploading}
              leftIcon={<UploadCloud className="h-4 w-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-800"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isDragging ? "Drop your files here" : "Click to browse or drag & drop files"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            PDF, DOCX, TXT, MD, CSV, JSON, PNG, JPEG, WEBP (up to 10 MB each)
          </p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                Uploading and extracting content...
              </span>
              <span className="font-mono font-bold">{uploadProgress}%</span>
            </div>
            <ProgressBar value={uploadProgress} size="sm" variant="brand" />
          </div>
        )}

        {/* Selected Files Queue */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Selected Files ({selectedFiles.length})
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(idx)
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default FileUploadModal
