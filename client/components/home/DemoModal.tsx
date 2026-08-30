"use client"

import React from "react"
import Link from "next/link"
import { Zap } from "lucide-react"

import { Button } from "@/components/ui/Button"

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Filox Live Demo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-semibold p-1 transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Filox provides fast cloud storage with automated text parsing for PDFs, Word documents, spreadsheets, and images. Sign up to get your 500 MB personal storage quota.
        </p>
        <div className="pt-2 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link href="/register">
            <Button size="sm" variant="brand" className="bg-blue-600 text-white">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
