"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import api, { getApiErrorMessage } from "../lib/axios"
import type { ApiResponse, User } from "../types/api"
import { useToast } from "./ToastProvider"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { success, error } = useToast()

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<User>>("/auth/profile")
      if (response.data.success && response.data.data) {
        setUser(response.data.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<ApiResponse<{ user: User }>>("/auth/login", { email, password })
      if (res.data.success) {
        const loggedUser = (res.data.data as unknown as { user: User }).user || res.data.data
        setUser(loggedUser as User)
        success("Logged in successfully", "Welcome back!")
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Login Failed")
      throw err
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post<ApiResponse<{ email: string }>>("/auth/register", {
        name,
        email,
        password,
      })
      if (res.data.success) {
        success("Account created. Please verify your email with the 6-digit OTP sent.", "Registration Successful")
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Registration Failed")
      throw err
    }
  }

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>("/auth/verify-email", { email, code })
      if (res.data.success) {
        success("Email verified successfully! Please sign in to access your vault.", "Verification Succeeded")
        router.push("/login")
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Verification Failed")
      throw err
    }
  }

  const resendOtp = async (email: string) => {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>("/auth/resend-code", { email })
      if (res.data.success) {
        success("A new 6-digit code has been generated.", "Code Sent")
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Resend Failed")
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Logout is idempotent (ADR-036)
    } finally {
      setUser(null)
      success("You have been signed out.", "Goodbye")
      router.push("/login")
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const res = await api.post<ApiResponse<User>>("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data.success && res.data.data) {
        setUser(res.data.data)
        success("Profile picture updated successfully!", "Avatar Updated")
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err)
      error(msg, "Upload Failed")
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
        uploadAvatar,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
