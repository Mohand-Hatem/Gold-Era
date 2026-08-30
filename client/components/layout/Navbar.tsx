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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Filox
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg ${
              isHome
                ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/50"
                : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#features"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1.5"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1.5"
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
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 px-2 py-1.5 rounded-lg"
            >
              <span>Resources</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  resourcesOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                }`}
              />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/#features"
                  className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-semibold">Text Extraction</div>
                    <div className="text-[10px] text-slate-400">Automatic OCR & parsing</div>
                  </div>
                </Link>
                <Link
                  href="/#pricing"
                  className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Storage Plans</div>
                    <div className="text-[10px] text-slate-400">Free 500 MB quota</div>
                  </div>
                </Link>
                <Link
                  href="/#support"
                  className="flex items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-semibold">Help & FAQ</div>
                    <div className="text-[10px] text-slate-400">Guides and support</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: User Actions & ThemeToggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="brand"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/20 px-4 py-2 font-semibold transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-95"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
                >
                  Login
                </button>
              </Link>
              <Link href="/register">
                <Button
                  variant="brand"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/20 px-5 py-2 transition-all hover:shadow-md hover:shadow-blue-500/30 active:scale-95"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions: ThemeToggle + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/50"
          >
            Home
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-600 dark:text-slate-300 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Pricing
          </Link>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="brand" size="sm" className="w-full bg-blue-600 text-white rounded-xl shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
