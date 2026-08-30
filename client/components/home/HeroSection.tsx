"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowRight, Play, Check, Cloud } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { DemoModal } from "./DemoModal"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDykDBbjk8Rs1zKftH03b6UwuXq-hLc9n384DVgbxdseXDxS9Y57DQfLl8Y6IexKP6gTrGC_A6qBwnYzri9-PrHOTTLkH6hUN7TWaSP518r8Y4dhNdirGafjhp2LP2X0IVw_VDXqy8tdRTwb7pLCJ6S_xG7oUM9ugs6pphWIcuSfx5MIymhxFJIrFDbOIUYWO1a11-P-76do0rUebNF-Uhm5YPsUhNKuSTtHCePhyc2muEXgbduG8ZmJA"

export const HeroSection = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  return (
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
                onClick={() => setIsDemoOpen(true)}
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

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  )
}
