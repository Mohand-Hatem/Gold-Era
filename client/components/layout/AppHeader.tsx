"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Folder,
  Menu,
  X,
  LayoutDashboard,
  Files,
  User,
  Shield,
  Users,
  LogOut,
} from "lucide-react"

import { useAuth } from "../../providers/AuthProvider"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "../ui/ThemeToggle"

export function AppHeader() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Files", href: "/files", icon: Files },
    { label: "Profile", href: "/profile", icon: User },
  ]

  const adminNavItems = [
    { label: "System Metrics", href: "/admin", icon: Shield },
    { label: "User Management", href: "/admin/users", icon: Users },
  ]

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/files") return "My Files"
    if (pathname.startsWith("/files/")) return "File Details"
    if (pathname === "/profile") return "User Profile"
    if (pathname === "/admin") return "Admin Overview"
    if (pathname === "/admin/users") return "User Management"
    return "Filox"
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Signed in as</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
          </div>
          <div className="flex h-8.5 w-8.5 items-center justify-center overflow-hidden rounded-xl bg-blue-600 font-bold text-white text-xs shadow-xs">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Folder className="h-4 w-4 fill-white/20" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Filox</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}

              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppHeader
