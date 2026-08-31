"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Folder,
  LayoutDashboard,
  Files,
  User,
  Shield,
  Users,
  LogOut,
} from "lucide-react"

import { useAuth } from "../../providers/AuthProvider"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/Badge"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Files", href: "/files", icon: Files },
    { label: "Profile", href: "/profile", icon: User },
  ]

  const adminNavItems = [
    { label: "System Metrics", href: "/admin", icon: Shield },
    { label: "User Management", href: "/admin/users", icon: Users },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 lg:flex transition-colors duration-200">
      {/* App Branding */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shadow-blue-500/20">
          <Folder className="h-5 w-5 fill-white/20" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Filox
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            File Management
          </span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500",
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Admin Menu */}
        {isAdmin && (
          <div className="mt-8 space-y-1">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Admin Center
              </span>
              <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                Admin
              </Badge>
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500",
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-3">
          <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-600 font-semibold text-white text-sm shadow-xs group-hover:ring-2 group-hover:ring-blue-500/40 transition-all">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            title="Log Out"
            className="rounded-xl p-2 text-slate-400 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors active:scale-90 cursor-pointer"
            aria-label="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar
