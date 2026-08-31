"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Folder,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
} from "lucide-react"

import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/Button"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const isHome = pathname === "/"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo (Column 1) */}
        <div className="flex items-center flex-1 justify-start">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Filox
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Vault
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Balanced Navigation Links (Column 2) */}
        <nav className="hidden md:flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <Link
            href="/"
            className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-xl cursor-pointer ${
              isHome
                ? "text-blue-600 dark:text-blue-400 font-semibold bg-white dark:bg-slate-900 shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-200 px-4 py-2 rounded-xl cursor-pointer"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-200 px-4 py-2 rounded-xl cursor-pointer"
          >
            Pricing
          </Link>

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-200 inline-flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer"
            >
              <span>Resources</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  resourcesOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                }`}
              />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                <Link
                  href="/#features"
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Text Extraction</div>
                    <div className="text-[10px] text-slate-400">Automatic OCR & parsing</div>
                  </div>
                </Link>
                <Link
                  href="/#pricing"
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Storage Plans</div>
                    <div className="text-[10px] text-slate-400">Free 500 MB quota</div>
                  </div>
                </Link>
                <Link
                  href="/#support"
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Help & FAQ</div>
                    <div className="text-[10px] text-slate-400">Guides and support</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Auth Actions & ThemeToggle (Column 3) */}
        <div className="hidden md:flex items-center justify-end gap-3 flex-1">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="brand"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs shadow-blue-500/20 px-4 py-2 font-semibold transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-95 cursor-pointer"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer"
                >
                  Login
                </button>
              </Link>
              <Link href="/register">
                <Button
                  variant="brand"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs shadow-blue-500/20 px-4 py-2 transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-95 cursor-pointer"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-4 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-blue-600 dark:text-blue-400 py-2.5 px-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 cursor-pointer"
            >
              Home
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2.5 px-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2.5 px-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Pricing
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="brand" size="md" className="w-full bg-blue-600 text-white rounded-xl shadow-xs cursor-pointer">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full rounded-xl cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="brand" size="md" className="w-full bg-blue-600 text-white rounded-xl shadow-xs cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
