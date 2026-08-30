import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "../providers/AuthProvider"
import { QueryProvider } from "../providers/QueryProvider"
import { ToastProvider } from "../providers/ToastProvider"
import { ThemeProvider } from "../providers/ThemeProvider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Filox — All Your Files, One Secure Place",
  description: "Modern, secure file management, cloud storage, and automated content extraction system.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
