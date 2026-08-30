import React from "react"
import Link from "next/link"
import { UploadCloud, Folder, Share2, Smartphone, Cloud, Lock } from "lucide-react"

export const UploadShowcaseSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-[#EEF4FD] dark:bg-slate-900/90 p-8 sm:p-10 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Device Vector Graphic */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Cloud Header */}
              <div className="flex h-14 w-20 items-center justify-center rounded-full bg-blue-200/60 dark:bg-blue-900/40 mb-2 shadow-2xs">
                <Cloud className="h-8 w-8 text-blue-500 dark:text-blue-400 fill-blue-500/30" />
              </div>
              {/* Laptop Graphic */}
              <div className="w-52 h-32 rounded-t-xl border-4 border-slate-700 dark:border-slate-600 bg-slate-900 p-2 relative shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-blue-100 dark:bg-slate-800 rounded flex items-center justify-center">
                  <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400 fill-blue-600/40" />
                </div>
              </div>
              <div className="w-64 h-3 bg-slate-800 dark:bg-slate-700 rounded-b-md shadow-md" />
              {/* Phone Graphic */}
              <div className="absolute -right-3 bottom-0 w-14 h-24 rounded-xl border-2 border-slate-700 dark:border-slate-600 bg-slate-900 p-1 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-blue-50 dark:bg-slate-800 rounded flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Center: Upload Dropzone Box */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
                Drag & Drop Upload
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Simply drag your files or click to upload. Supports all major file types.
              </p>
            </div>

            <Link href="/register">
              <div className="rounded-2xl border-2 border-dashed border-[#A5C7F9] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-slate-700/50 transition-all duration-300 cursor-pointer shadow-2xs group">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <UploadCloud className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:-translate-y-0.5" />
                  <span>Drag & drop files here or </span>
                  <span className="text-blue-600 dark:text-blue-400 underline font-bold">browse files</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Feature Checklist */}
          <div className="lg:col-span-3 space-y-3.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <span>Secure Cloud Storage</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                <Folder className="h-4 w-4" />
              </div>
              <span>Smart File Organization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                <Share2 className="h-4 w-4" />
              </div>
              <span>Easy Sharing</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                <Smartphone className="h-4 w-4" />
              </div>
              <span>Access on Any Device</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
