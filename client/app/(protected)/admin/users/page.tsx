"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Users,
  Search,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Files,
  UserCheck,
  UserX,
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { EmptyState, Skeleton } from "@/components/ui/EmptyState"
import { formatDate } from "@/lib/utils"
import api, { getApiErrorMessage } from "@/lib/axios"
import type { ApiResponse, Role, UserWithFileCount } from "@/types/api"
import { useAuth } from "@/providers/AuthProvider"
import { useToast } from "@/providers/ToastProvider"

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const limit = 10

  const [targetUserRole, setTargetUserRole] = useState<UserWithFileCount | null>(null)
  const [newRole, setNewRole] = useState<Role>("USER")
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)

  const [targetUserDelete, setTargetUserDelete] = useState<UserWithFileCount | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  // Query users
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["admin-users", { page, limit, search, role: roleFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
      }
      if (search.trim()) params.search = search.trim()
      if (roleFilter !== "ALL") params.role = roleFilter

      const res = await api.get<ApiResponse<UserWithFileCount[]>>("/users", { params })
      return res.data
    },
  })

  const users = data?.data || []
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 }

  // Handle Role Change
  const handleUpdateRole = async () => {
    if (!targetUserRole) return

    if (currentAdmin?.id === targetUserRole.id && newRole !== "ADMIN") {
      error("You cannot demote your own administrator account.", "Action Forbidden")
      return
    }

    setIsUpdatingRole(true)
    try {
      await api.patch(`/users/${targetUserRole.id}/role`, { role: newRole })
      success(
        `Updated role for ${targetUserRole.name} to ${newRole}`,
        "Role Updated",
      )
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setTargetUserRole(null)
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Role Update Failed")
    } finally {
      setIsUpdatingRole(false)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!targetUserDelete) return

    if (currentAdmin?.id === targetUserDelete.id) {
      error("You cannot delete your own administrator account.", "Action Forbidden")
      return
    }

    setIsDeletingUser(true)
    try {
      await api.delete(`/users/${targetUserDelete.id}`)
      success(
        `User ${targetUserDelete.name} and all associated files deleted.`,
        "User Deleted",
      )
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setTargetUserDelete(null)
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Deletion Failed")
    } finally {
      setIsDeletingUser(false)
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Overview
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            User Account Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View all registered users, manage administrative roles, and enforce security policies.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name or email..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Role:</span>
            <div className="flex items-center gap-1">
              {(["ALL", "USER", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r)
                    setPage(1)
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    roleFilter === r
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r === "ALL" ? "All Roles" : r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-blue-500" />}
            title="No users found"
            description={
              search
                ? `No accounts matching "${search}".`
                : "No registered accounts found in this filter."
            }
            className="my-8"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Files</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {users.map((u) => {
                  const isCurrent = currentAdmin?.id === u.id
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-xs shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              u.name?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              {u.name}
                              {isCurrent && (
                                <span className="rounded-md bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === "ADMIN" ? (
                          <Badge variant="brand">ADMIN</Badge>
                        ) : (
                          <Badge variant="default">USER</Badge>
                        )}
                      </td>

                      {/* Verified Status */}
                      <td className="py-3.5 px-4">
                        {u.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Files Count */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                        {u._count?.files ?? 0} files
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetUserRole(u)
                              setNewRole(u.role)
                            }}
                            className="text-xs h-8 px-2.5"
                          >
                            Change Role
                          </Button>
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setTargetUserDelete(u)}
                            title={isCurrent ? "You cannot delete yourself" : "Delete User"}
                            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-4 py-3 sm:px-6">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing page <span className="font-semibold text-slate-900 dark:text-white">{meta.page}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{meta.totalPages}</span> ({meta.total} users)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || isPlaceholderData}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-1">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={page === meta.totalPages || isPlaceholderData}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Change Modal */}
      {targetUserRole && (
        <Modal
          isOpen={!!targetUserRole}
          onClose={() => setTargetUserRole(null)}
          title="Change User Role"
          description={`Update permission scope for ${targetUserRole.name}`}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetUserRole(null)}
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={handleUpdateRole}
                isLoading={isUpdatingRole}
              >
                Save Role
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Select the new access role for <strong>{targetUserRole.name}</strong> ({targetUserRole.email}):
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewRole("USER")}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  newRole === "USER"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-600/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Standard User
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Access to personal files vault only.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setNewRole("ADMIN")}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  newRole === "ADMIN"
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 ring-2 ring-purple-600/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900 dark:text-purple-300">
                  <ShieldAlert className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Administrator
                </div>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-300/70 mt-1">
                  Full system access, user management and system metrics.
                </p>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {targetUserDelete && (
        <Modal
          isOpen={!!targetUserDelete}
          onClose={() => setTargetUserDelete(null)}
          title="Confirm User Deletion"
          description={`Permanently remove ${targetUserDelete.name}'s account`}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetUserDelete(null)}
                disabled={isDeletingUser}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteUser}
                isLoading={isDeletingUser}
              >
                Permanently Delete User
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-red-800 dark:text-red-300 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>Warning:</strong> This will cascade delete all{" "}
                <strong>{targetUserDelete._count?.files ?? 0} files</strong> belonging to this user from both the database and Cloudinary storage.
              </div>
            </div>
            <p>
              Are you sure you want to delete <strong>{targetUserDelete.name}</strong> ({targetUserDelete.email})?
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
