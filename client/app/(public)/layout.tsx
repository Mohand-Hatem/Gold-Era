import React from "react"

import { Footer } from "../../components/layout/Footer"
import { Navbar } from "../../components/layout/Navbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
