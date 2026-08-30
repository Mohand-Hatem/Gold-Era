"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Folder, Mail, Lock, LogIn, AlertCircle } from "lucide-react"

import { Button } from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Input } from "../../../components/ui/Input"
import { useAuth } from "../../../providers/AuthProvider"

export default function LoginPage() {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnverified, setIsUnverified] = useState(false)

  const validate = () => {
    const errs: typeof errors = {}
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address"
    }

    if (!password) {
      errs.password = "Password is required"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUnverified(false)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err: unknown) {
      // Check if unverified error
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: { code?: string } } } }
        if (axiosErr.response?.data?.error?.code === "ERR_EMAIL_NOT_VERIFIED") {
          setIsUnverified(true)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Filox</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your dashboard and documents
          </p>
        </div>

        {/* Unverified Email Warning Banner */}
        {isUnverified && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-800 dark:text-amber-300 animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Email Not Verified:</span> Your account requires OTP email verification before you can sign in.
              <Link
                href={`/verify-email?email=${encodeURIComponent(email)}`}
                className="mt-1.5 block font-bold text-amber-900 dark:text-amber-200 underline"
              >
                Click here to enter your verification code &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Card Form */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Sign In</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Enter your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
                disabled={isSubmitting}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                size="md"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11"
                isLoading={isSubmitting}
                rightIcon={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Create an Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
