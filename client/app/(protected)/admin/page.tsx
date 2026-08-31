"use client"

import React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Users,
  Files,
  HardDrive,
  TrendingUp,
  PieChart as PieChartIcon,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/EmptyState"
import { formatBytes } from "@/lib/utils"
import api from "@/lib/axios"
import type { AdminDashboardStats, ApiResponse } from "@/types/api"

const CATEGORY_COLORS: Record<string, string> = {
  DOCUMENT: "#3b82f6",
  IMAGE: "#a855f7",
  TEXT: "#10b981",
  OTHER: "#f59e0b",
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "admin"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminDashboardStats>>("/stats/admin")
      return res.data.data
    },
  })

  const stats = data

  const categoryPieData = stats?.categories
    ? Object.entries(stats.categories).map(([key, stat]) => ({
        name: key.charAt(0) + key.slice(1).toLowerCase(),
        key,
        value: stat.count,
        bytes: stat.totalBytes,
        color: CATEGORY_COLORS[key] || "#64748b",
      }))
    : []

  const trendData = stats?.uploadTrend || []

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Overview & Analytics
            </h1>
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300">
              Admin Console
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform-wide resource consumption, 30-day activity trends, and registered users directory.
          </p>
        </div>

        <Link href="/admin/users">
          <Button
            variant="brand"
            size="md"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
          >
            Manage Users
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Users */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Users
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shadow-2xs">
              <Users className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {stats?.totalUsers ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered platform accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Files */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total System Files
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shadow-2xs">
              <Files className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 rounded-lg" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {stats?.totalFiles ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all user accounts
            </p>
          </CardContent>
        </Card>

        {/* Total Storage Used */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Storage Volume
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <HardDrive className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 rounded-lg" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {formatBytes(stats?.totalStorageBytes ?? 0)}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authenticated cloud storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 30-Day Activity Trend AreaChart */}
        <Card className="lg:col-span-8 flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              30-Day Upload Activity Trend
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Daily file upload volume across the entire platform
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickFormatter={(val: string) => val.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val ?? 0} uploads`, "Upload Count"]}
                      labelFormatter={(label: any) => `Date: ${label}`}
                      contentStyle={{
                        borderRadius: "14px",
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        color: "#f8fafc",
                        fontSize: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#uploadGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Category Distribution PieChart */}
        <Card className="lg:col-span-4 flex flex-col border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              Category Breakdown
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Distribution of all stored assets
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : categoryPieData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400">No assets recorded in system</p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val ?? 0} files (${formatBytes(item?.payload?.bytes ?? 0)})`,
                        item?.payload?.name,
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
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
