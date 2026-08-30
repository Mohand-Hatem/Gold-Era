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
import { Badge, FileTypeBadge } from "@/components/ui/Badge"
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here is an overview of your storage usage and recent document activity.
          </p>
        </div>

        <Button
          variant="brand"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<UploadCloud className="h-4 w-4" />}
          className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          Upload New File
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Files Card */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Files
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Files className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalFiles}</div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Documents stored in your personal vault
            </p>
          </CardContent>
        </Card>

        {/* Storage Consumption Card */}
        <Card className="md:col-span-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Storage Usage
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <HardDrive className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatBytes(totalStorageBytes)}{" "}
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    / {formatBytes(storageLimitBytes)}
                  </span>
                </div>
              )}
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{storagePercent}% Used</span>
            </div>

            <ProgressBar value={storagePercent} variant="brand" size="md" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Free plan quota (500 MB capacity)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Chart */}
        <Card className="lg:col-span-6 flex flex-col border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              File Categories Distribution
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              File count and volume across categories
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
                <p className="text-xs text-slate-500 dark:text-slate-400">No documents uploaded yet to display distribution</p>
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
                        borderRadius: "12px",
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
        <Card className="lg:col-span-6 flex flex-col border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Recently Uploaded
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Latest assets in your storage vault
              </CardDescription>
            </div>
            <Link
              href="/files"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>

          <CardContent className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !stats?.recentFiles || stats.recentFiles.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">No recent documents</p>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  leftIcon={<UploadCloud className="h-4 w-4" />}
                >
                  Upload Your First File
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <FileTypeBadge category={file.category} extension={file.originalName.split(".").pop() || ""} />
                      <div className="min-w-0">
                        <Link
                          href={`/files/${file.id}`}
                          className="block truncate text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        >
                          {file.originalName}
                        </Link>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {formatBytes(file.size)} • {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/files/${file.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
