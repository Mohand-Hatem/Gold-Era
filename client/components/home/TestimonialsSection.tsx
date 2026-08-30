import React from "react"
import { CircularTestimonials } from "@/components/ui/circular-testimonials"

const testimonialsData = [
  {
    quote:
      "Filox transformed how our team manages PDF contracts and research files. The automated text extraction pulls out text instantly without needing manual OCR tools.",
    name: "Elena Rostova",
    designation: "Head of Product, NextScale",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "Having lightning-fast personal cloud storage with instant multi-device sync has made accessing documents effortless whether I am on my laptop or mobile phone.",
    name: "Marcus Vance",
    designation: "Lead Software Architect",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "The clean interface, high-contrast dark mode, and rock-solid file security make Filox our favorite platform for archiving design assets and client reports.",
    name: "Sophia Chen",
    designation: "Creative Director",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1368&auto=format&fit=crop",
  },
]

export const TestimonialsSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
      <div className="mb-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
          Loved by Developers & Teams
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
          See how professionals around the globe organize, extract, and secure their digital documents.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <CircularTestimonials
          testimonials={testimonialsData}
          autoplay={true}
        />
      </div>
    </section>
  )
}
