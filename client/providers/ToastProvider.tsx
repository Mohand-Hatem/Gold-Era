"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react"

import { cn } from "../lib/utils"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType
      title?: string
      message: string
      duration?: number
    }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, type, title, message }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast],
  )

  const success = useCallback(
    (message: string, title?: string) => toast({ type: "success", title, message }),
    [toast],
  )
  const error = useCallback(
    (message: string, title?: string) => toast({ type: "error", title, message }),
    [toast],
  )
  const info = useCallback(
    (message: string, title?: string) => toast({ type: "info", title, message }),
    [toast],
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        aria-live="assertive"
        className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
            error: <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
            warning: <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
            info: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
          }

          const borderColors = {
            success: "border-emerald-200 bg-white",
            error: "border-red-200 bg-white",
            warning: "border-amber-200 bg-white",
            info: "border-blue-200 bg-white",
          }

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2",
                borderColors[t.type],
              )}
            >
              {icons[t.type]}
              <div className="flex-1 text-sm">
                {t.title && <div className="font-semibold text-slate-900">{t.title}</div>}
                <div className="text-slate-600">{t.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export default ToastProvider
