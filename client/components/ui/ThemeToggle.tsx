"use client"

import React, { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

import { useTheme } from "@/providers/ThemeProvider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-xl border border-slate-200 bg-white/50 ${className}`} />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 shadow-2xs transition-all duration-200 active:scale-90 ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
      ) : (
        <Moon className="h-4.5 w-4.5 transition-transform duration-300 rotate-0 scale-100 text-slate-700" />
      )}
    </button>
  )
}

export default ThemeToggle
