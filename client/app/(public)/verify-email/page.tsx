"use client"

import React, { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Folder, KeyRound, CheckCircle2, RotateCw } from "lucide-react"

import { Button } from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Input } from "../../../components/ui/Input"
import { useAuth } from "../../../providers/AuthProvider"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""

  const { verifyEmail, resendOtp } = useAuth()

  const [email, setEmail] = useState(initialEmail)
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(60)

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // 60-second timer countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    setError(null)
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    const char = value.slice(-1)
    newDigits[index] = char
    setDigits(newDigits)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return

    const newDigits = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)

    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join("")

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (code.length !== 6) {
      setError("Please enter all 6 digits of the verification code")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await verifyEmail(email.trim(), code)
    } catch {
      // AuthProvider surfaces the toast message
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || isResending) return

    setIsResending(true)
    try {
      await resendOtp(email.trim())
      setCooldown(60)
      setDigits(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch {
      // Toast displayed
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Filox</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter the 6-digit verification code sent to your inbox
          </p>
        </div>

        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Security Verification
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                OTP codes expire in 15 minutes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />

              {/* 6-Digit Segmented Code Inputs */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  6-Digit OTP Code
                </label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      disabled={isSubmitting}
                      className="h-12 w-12 text-center text-xl font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 font-mono shadow-2xs transition-all"
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2 animate-in fade-in">
                    {error}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                size="md"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Verify & Continue
              </Button>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 w-full">
                <span>Didn&apos;t receive a code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:text-slate-400 dark:disabled:text-slate-600 disabled:no-underline flex items-center gap-1"
                >
                  <RotateCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
