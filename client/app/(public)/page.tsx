"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Play,
  Check,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Folder,
  Share2,
  Smartphone,
  MoreHorizontal,
  Cloud,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/Button"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDykDBbjk8Rs1zKftH03b6UwuXq-hLc9n384DVgbxdseXDxS9Y57DQfLl8Y6IexKP6gTrGC_A6qBwnYzri9-PrHOTTLkH6hUN7TWaSP518r8Y4dhNdirGafjhp2LP2X0IVw_VDXqy8tdRTwb7pLCJ6S_xG7oUM9ugs6pphWIcuSfx5MIymhxFJIrFDbOIUYWO1a11-P-76do0rUebNF-Uhm5YPsUhNKuSTtHCePhyc2muEXgbduG8ZmJA"

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState(false)

  const categories = [
    {
      name: "Documents",
      desc: "Work files & reports",
      count: "PDF, DOCX, TXT",
      icon: (
        <svg className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      ),
      bg: "bg-blue-50/70 dark:bg-blue-950/40 group-hover:bg-blue-100/70",
    },
    {
      name: "Images",
      desc: "Photos & graphics",
      count: "PNG, JPG, WebP",
      icon: (
        <svg className="h-6 w-6 text-purple-500 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
      bg: "bg-purple-50/70 dark:bg-purple-950/40 group-hover:bg-purple-100/70",
    },
    {
      name: "Videos",
      desc: "Media files",
      count: "MP4, MOV, MKV",
      icon: (
        <svg className="h-6 w-6 text-indigo-500 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 8-6 4 6 4V8Z" />
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
      ),
      bg: "bg-indigo-50/70 dark:bg-indigo-950/40 group-hover:bg-indigo-100/70",
    },
    {
      name: "Audio",
      desc: "Music & recordings",
      count: "MP3, WAV, FLAC",
      icon: (
        <svg className="h-6 w-6 text-sky-500 dark:text-sky-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
      bg: "bg-sky-50/70 dark:bg-sky-950/40 group-hover:bg-sky-100/70",
    },
    {
      name: "Archives",
      desc: "ZIP, RAR & more",
      count: "ZIP, TAR, GZ",
      icon: (
        <svg className="h-6 w-6 text-amber-500 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v4" />
          <path d="M14 2v4" />
          <path d="M4 6h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path d="M10 10v4" />
          <path d="M14 10v4" />
          <path d="M10 14h4" />
        </svg>
      ),
      bg: "bg-amber-50/70 dark:bg-amber-950/40 group-hover:bg-amber-100/70",
    },
  ]

  const recentFiles = [
    {
      name: "Project_Proposal.pdf",
      owner: "You",
      modified: "May 14, 2024",
      size: "2.4 MB",
      type: "PDF",
      badgeClass: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/70 dark:border-red-900/50",
      icon: (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white font-bold text-[9px] shadow-2xs">
          PDF
        </div>
      ),
    },
    {
      name: "Website_Mockup.png",
      owner: "You",
      modified: "May 13, 2024",
      size: "1.8 MB",
      type: "Image",
      badgeClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/70 dark:border-purple-900/50",
      icon: (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-white shadow-2xs">
          <ImageIcon className="h-3.5 w-3.5" />
        </div>
      ),
    },
    {
      name: "Team_Notes.docx",
      owner: "You",
      modified: "May 12, 2024",
      size: "1.2 MB",
      type: "Document",
      badgeClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50",
      icon: (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-[10px] shadow-2xs">
          W
        </div>
      ),
    },
    {
      name: "Budget_2024.xlsx",
      owner: "You",
      modified: "May 11, 2024",
      size: "980 KB",
      type: "Spreadsheet",
      badgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50",
      icon: (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-[10px] shadow-2xs">
          X
        </div>
      ),
    },
    {
      name: "Marketing Assets",
      owner: "You",
      modified: "May 10, 2024",
      size: "-",
      type: "Folder",
      badgeClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50",
      icon: (
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400 text-white shadow-2xs">
          <Folder className="h-3.5 w-3.5 fill-current" />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-16 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ─── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-16">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-full max-w-4xl bg-gradient-to-b from-blue-100/50 dark:from-blue-900/20 via-indigo-50/20 dark:via-indigo-950/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Display Typography & CTAs */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-[1.12]">
                All Your Files,<br />
                <span className="text-slate-900 dark:text-slate-100">One Secure Place</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-md leading-relaxed font-normal">
                Store, organize and share your files with confidence. Access everything, anywhere, anytime.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="brand"
                    rightIcon={<ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold px-6 h-12 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all text-sm active:scale-95"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedDemo(true)}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 h-12 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all active:scale-95 group"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                    <Play className="h-3 w-3 fill-current ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Private</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Always Available</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Folder & Floating Storage Card Overlay */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto w-full max-w-lg rounded-3xl bg-[#EEF5FD] dark:bg-slate-900/80 border border-transparent dark:border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xs group">
                {/* 3D Visual Centerpiece */}
                <div className="relative aspect-[4/3] flex items-center justify-center">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Filox 3D Cloud Storage"
                    className="w-full h-full object-contain z-10 relative drop-shadow-xl transition-transform duration-500 group-hover:scale-103"
                  />
                </div>

                {/* Storage Card Overlay with Float Animation */}
                <div className="absolute bottom-6 right-6 rounded-2xl bg-white/98 dark:bg-slate-800/98 backdrop-blur-md p-4 shadow-xl shadow-slate-900/10 border border-slate-100/90 dark:border-slate-700 z-20 w-48 animate-float">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-2xs">
                      <Cloud className="h-5 w-5 fill-blue-600 dark:fill-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">1.2 TB</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">of storage used</div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full w-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Keep Everything Organized (5 Category Cards) ─────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
            Keep Everything Organized
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Upload, manage and access all your files in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F0F5FD] dark:bg-slate-900 hover:bg-[#E5EFFC] dark:hover:bg-slate-800/90 border border-transparent hover:border-blue-200/80 dark:hover:border-blue-900/60 transition-all duration-300 cursor-pointer group shadow-2xs hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-2xs mb-3.5 transition-transform duration-300 group-hover:scale-105`}>
                {cat.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. Recent Files Table ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Files</h2>
            <Link
              href="/register"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">Name</th>
                  <th className="py-3 px-3 font-semibold">Owner</th>
                  <th className="py-3 px-3 font-semibold">Last Modified</th>
                  <th className="py-3 px-3 font-semibold">Size</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentFiles.map((file) => (
                  <tr
                    key={file.name}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      {file.icon}
                      <span className="truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {file.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">{file.owner}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs font-mono">{file.modified}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs font-mono">{file.size}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${file.badgeClass}`}
                      >
                        {file.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 dark:text-slate-500">
                      <button
                        type="button"
                        className="p-1 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                        aria-label="Options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── 4. Drag & Drop Upload Section ────────────────────────────────── */}
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

      {/* ─── 5. Ready to Simplify Your File Management? (Bottom Banner) ───── */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-blue-100 dark:border-slate-800 bg-gradient-to-r from-[#EBF3FE] dark:from-slate-900 via-[#E5EFFE] dark:via-slate-900/90 to-[#DDEAFE] dark:to-slate-800 p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-tight">
                Ready to Simplify<br />
                Your File Management?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Join thousands of users who trust Filox for their files, work and memories.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="brand"
                    rightIcon={<ArrowRight className="h-4 w-4 ml-1" />}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold px-6 h-12 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all text-sm active:scale-95"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 h-12 shadow-2xs text-sm active:scale-95 transition-all"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Curved Graphic with 3D folder visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full aspect-video flex items-center justify-center">
                <img
                  src={HERO_IMAGE_URL}
                  alt="Simplify File Management with Filox"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {selectedDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Filox Live Demo</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDemo(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filox provides fast cloud storage with automated text parsing for PDFs, Word documents, spreadsheets, and images. Sign up to get your 500 MB personal storage quota.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedDemo(false)}>
                Close
              </Button>
              <Link href="/register">
                <Button size="sm" variant="brand" className="bg-blue-600 text-white">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
