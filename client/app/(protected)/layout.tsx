"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"

import { AppHeader } from "../../components/layout/AppHeader"
import { AppSidebar } from "../../components/layout/AppSidebar"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../providers/AuthProvider"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, isAuthenticated, router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Filox...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Guard admin routes (DOCS 08, DOCS 22)
  if (pathname.startsWith("/admin") && !isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <AppSidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <AppHeader />
          <main className="flex flex-1 items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Access Restricted
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Administrator permissions are required to access this section.
              </p>
              <Button variant="brand" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <AppSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
