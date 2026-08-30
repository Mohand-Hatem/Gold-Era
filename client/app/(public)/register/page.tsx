"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Folder, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react"

import { Button } from "../../../components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card"
import { Input } from "../../../components/ui/Input"
import { useAuth } from "../../../providers/AuthProvider"

export default function RegisterPage() {
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = "Name is required"
    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address"
    }

    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register(name.trim(), email.trim(), password)
    } catch {
      // Error toast is handled by AuthProvider
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Filox</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Start managing and extracting text from your files securely
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Sign Up</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Enter your personal details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                leftIcon={<UserIcon className="h-4 w-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                autoComplete="name"
                disabled={isSubmitting}
              />

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
                helperText="Must be at least 8 characters"
                autoComplete="new-password"
                disabled={isSubmitting}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
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
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account
              </Button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
