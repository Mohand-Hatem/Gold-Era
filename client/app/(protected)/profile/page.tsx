"use client"

import React, { useRef, useState } from "react"
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle2,
  Calendar,
  Key,
  LogOut,
  Camera,
  Loader2,
  Upload,
} from "lucide-react"

import { Badge } from "../../../components/ui/Badge"
import { Button } from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card"
import { formatDate } from "../../../lib/utils"
import { useAuth } from "../../../providers/AuthProvider"
import { useToast } from "../../../providers/ToastProvider"

export default function ProfilePage() {
  const { user, logout, isAdmin, uploadAvatar } = useAuth()
  const { error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!user) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      error("Please select a valid image file (PNG, JPG, WebP)", "Invalid File")
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      error("Profile picture size must be less than 4 MB", "File Too Large")
      return
    }

    setIsUploading(true)
    try {
      await uploadAvatar(file)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl text-slate-900 dark:text-slate-100">
      {/* Header Banner with Interactive Avatar Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-5">
          {/* Avatar Container with Upload Trigger */}
          <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-blue-600 font-bold text-white text-3xl shadow-lg shadow-blue-500/20 border-2 border-white dark:border-slate-800 group-hover:ring-4 group-hover:ring-blue-500/30 transition-all">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name?.[0]?.toUpperCase() || "U"
              )}

              {/* Uploading Overlay Spinner */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-2xs">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              type="button"
              disabled={isUploading}
              title="Change Profile Picture"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Camera className="h-4 w-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              {isAdmin ? (
                <Badge variant="brand">ADMIN</Badge>
              ) : (
                <Badge variant="default">USER</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="h-3 w-3" />
              {user.avatarUrl ? "Change Photo" : "Upload Profile Photo"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Account Details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Your personal profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Display Name</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user.name}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Email Address</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {user.email}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">User Identifier (CUID)</span>
              <p className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 mt-0.5">
                {user.id}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Member Since</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Security & Verification
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Account status and authentication credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Email Verification</span>
              <div className="flex items-center gap-2 mt-1">
                {user.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Account
                  </span>
                ) : (
                  <Badge variant="default">Unverified</Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Role & Scope</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mt-0.5">
                <Key className="h-3.5 w-3.5 text-slate-400" />
                {user.role === "ADMIN" ? "System Administrator (Full Scope)" : "Standard User (Isolated Vault)"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Password Hashing</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Secured with Bcrypt (12 cost salt rounds)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
