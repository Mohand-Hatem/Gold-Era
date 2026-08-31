"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Files,
  HardDrive,
  UploadCloud,
  ArrowRight,
  Eye,
  PieChart as PieChartIcon,
  Clock,
  Loader2,
  FolderLock,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { FileTypeBadge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Skeleton } from "@/components/ui/EmptyState"
import { FileUploadModal } from "@/components/files/FileUploadModal"
import { formatBytes, formatDate } from "@/lib/utils"
import api from "@/lib/axios"
import type { ApiResponse, UserDashboardStats } from "@/types/api"
import { useAuth } from "@/providers/AuthProvider"

const CATEGORY_COLORS: Record<string, string> = {
  DOCUMENT: "#3b82f6", // Blue
  IMAGE: "#a855f7", // Purple
  TEXT: "#10b981", // Emerald
  OTHER: "#f59e0b", // Amber
}

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["stats", "me"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserDashboardStats>>("/stats/me")
      return res.data.data
    },
  })

  const stats = data

  const totalFiles = stats?.totalFiles || 0
  const totalStorageBytes = stats?.totalStorageBytes || 0
  const storageLimitBytes = stats?.storageLimitBytes || 500 * 1024 * 1024
  const storagePercent = Math.min(
    Math.round((totalStorageBytes / storageLimitBytes) * 100),
    100,
  )

  const categoryChartData = stats?.categories
    ? Object.entries(stats.categories).map(([key, stat]) => ({
        name: key.charAt(0) + key.slice(1).toLowerCase(),
        key,
        count: stat.count,
        bytes: stat.totalBytes,
        color: CATEGORY_COLORS[key] || "#64748b",
      }))
    : []

  const hasFiles = totalFiles > 0

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Vault Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of your storage consumption, recent uploads, and file extraction analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/files">
            <Button
              variant="outline"
              size="md"
              className="rounded-xl cursor-pointer shadow-xs"
            >
              Browse Files
            </Button>
          </Link>
          <Button
            variant="brand"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<UploadCloud className="h-4 w-4" />}
            className="shadow-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer"
          >
            Upload File
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Files Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Files
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Files className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {totalFiles}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <span>Encrypted records in storage</span>
            </p>
          </CardContent>
        </Card>

        {/* Storage Consumption Card */}
        <Card className="sm:col-span-2 lg:col-span-2 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Storage Vault Capacity
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shadow-2xs">
              <HardDrive className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-7 w-36 rounded-lg" />
              ) : (
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatBytes(totalStorageBytes)}{" "}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                    used of {formatBytes(storageLimitBytes)} quota
                  </span>
                </div>
              )}
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                storagePercent > 90
                  ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                  : storagePercent > 70
                  ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                  : "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
              }`}>
                {storagePercent}% Used
              </span>
            </div>

            <ProgressBar value={storagePercent} variant="brand" size="md" />
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Standard 500 MB Free Tier</span>
              <span>{formatBytes(Math.max(storageLimitBytes - totalStorageBytes, 0))} remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Recent Uploads Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Chart */}
        <Card className="lg:col-span-6 flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              File Distribution by Category
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Breakdown of uploaded files and storage consumption
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : !hasFiles ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Files className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No documents uploaded yet to display category distribution.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val ?? 0} files (${formatBytes(item?.payload?.bytes ?? 0)})`,
                        "Total",
                      ]}
                      contentStyle={{
                        borderRadius: "14px",
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        color: "#f8fafc",
                        fontSize: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {categoryChartData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files Table Summary */}
        <Card className="lg:col-span-6 flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                Recently Uploaded
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Latest assets in your storage vault
              </CardDescription>
            </div>
            <Link
              href="/files"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ) : !stats?.recentFiles || stats.recentFiles.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">No recent documents</p>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  leftIcon={<UploadCloud className="h-4 w-4" />}
                  className="cursor-pointer"
                >
                  Upload Your First File
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-3 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <FileTypeBadge category={file.category} extension={file.originalName.split(".").pop() || ""} />
                      <div className="min-w-0">
                        <Link
                          href={`/files/${file.id}`}
                          className="block truncate text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer"
                        >
                          {file.originalName}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                          {formatBytes(file.size)} • {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/files/${file.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                        <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal Dialog */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}
