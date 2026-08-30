import React from "react"

import { HeroSection } from "@/components/home/HeroSection"
import { CategorySection } from "@/components/home/CategorySection"
import { RecentFilesPreviewSection } from "@/components/home/RecentFilesPreviewSection"
import { UploadShowcaseSection } from "@/components/home/UploadShowcaseSection"
import { TestimonialsSection } from "@/components/home/TestimonialsSection"
import { CtaBannerSection } from "@/components/home/CtaBannerSection"

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28 pb-16 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <HeroSection />
      <CategorySection />
      <RecentFilesPreviewSection />
      <UploadShowcaseSection />
      <TestimonialsSection />
      <CtaBannerSection />
    </div>
  )
}
