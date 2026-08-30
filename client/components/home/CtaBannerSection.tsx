import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/Button"

const HERO_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDykDBbjk8Rs1zKftH03b6UwuXq-hLc9n384DVgbxdseXDxS9Y57DQfLl8Y6IexKP6gTrGC_A6qBwnYzri9-PrHOTTLkH6hUN7TWaSP518r8Y4dhNdirGafjhp2LP2X0IVw_VDXqy8tdRTwb7pLCJ6S_xG7oUM9ugs6pphWIcuSfx5MIymhxFJIrFDbOIUYWO1a11-P-76do0rUebNF-Uhm5YPsUhNKuSTtHCePhyc2muEXgbduG8ZmJA"

export const CtaBannerSection = () => {
  return (
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
  )
}
