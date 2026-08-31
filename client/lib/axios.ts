import axios, { type AxiosError } from "axios"

import type { ApiErrorResponse } from "../types/api"

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
export const apiBaseUrl = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`

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

/**
 * Builds the direct URL for a file download/preview.
 *
 * Deliberately not fetched through the `api` axios instance: the endpoint
 * issues a 302 redirect to Cloudinary (ADR-044 — Vercel Functions cap
 * response bodies at 4.5 MB, so bytes can no longer stream through the API).
 * A credentialed XHR/fetch that follows a cross-origin redirect has CORS
 * enforced on the final response, and Cloudinary's public delivery URLs
 * return a wildcard `Access-Control-Allow-Origin`, which browsers reject
 * outright for credentialed requests. Passive resource loads and navigations
 * (`<img src>`, a clicked `<a>`, `window.open`) are not subject to CORS at
 * all, and the auth cookie still attaches to them (`SameSite=None; Secure` —
 * ADR-008), so pointing one of those directly at this URL is what actually
 * works. Same pattern already used for avatar images.
 */
export function getFileDownloadUrl(
  fileId: string,
  disposition: "inline" | "attachment",
): string {
  return `${apiBaseUrl}/files/${fileId}/download?disposition=${disposition}`
}

export default api
