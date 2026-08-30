import axios, { type AxiosError } from "axios"

import type { ApiErrorResponse } from "../types/api"

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
const apiBaseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`

/**
 * Global Axios client configured with credentials for httpOnly cookie authentication (ADR-008).
 */
export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * Extracts a user-friendly error message from an API error response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>
    if (axiosErr.response?.data?.error?.message) {
      return axiosErr.response.data.error.message
    }
    if (axiosErr.response?.data?.error?.details?.[0]?.message) {
      return axiosErr.response.data.error.details[0].message
    }
    if (axiosErr.message) {
      return axiosErr.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred. Please try again."
}

export default api
