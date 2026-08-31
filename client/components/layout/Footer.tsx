import React from "react"
import Link from "next/link"
import { Folder, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Brand & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Filox
                </span>
                <span className="rounded-md bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure & intelligent file management vault
              </p>
            </div>
          </div>

          {/* Center: Equal-Spaced Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Pricing
            </Link>
            <Link
              href="/#support"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Support
            </Link>
            <Link
              href="/login"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1"
            >
              Register
            </Link>
          </nav>

          {/* Right: Social Media Buttons with Rounded Interactive Boundaries */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              aria-label="Twitter"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              aria-label="Facebook"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              aria-label="LinkedIn"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              aria-label="YouTube"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom divider with copyright notice */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Filox Cloud Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Security Vault</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
