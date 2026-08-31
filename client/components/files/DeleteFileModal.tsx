"use client"

import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Trash2 } from "lucide-react"

import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import api, { getApiErrorMessage } from "../../lib/axios"
import type { FileItem } from "../../types/api"
import { useToast } from "../../providers/ToastProvider"

export interface DeleteFileModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteFileModal({
  file,
  isOpen,
  onClose,
  onDeleted,
}: DeleteFileModalProps) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!file) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/files/${file.id}`)
      success(`"${file.originalName}" has been deleted.`, "File Deleted")
      queryClient.invalidateQueries({ queryKey: ["files"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      onDeleted?.()
      onClose()
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Deletion Failed")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete File"
      description="This action cannot be undone. Are you sure you want to permanently delete this file?"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Delete File
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/40 p-4 text-red-900 dark:text-red-200">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-red-900 dark:text-red-100 truncate">
            {file.originalName}
          </p>
          <p className="text-red-700 dark:text-red-300">
            Deleting this file will permanently remove the database record, extracted text index, and authenticated cloud blob.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteFileModal
