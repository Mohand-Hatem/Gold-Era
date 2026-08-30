import type { Response } from "express"

import type { ErrorCode, ErrorDetail } from "./AppError.js"

/**
 * Response envelope builders (BE-003).
 *
 * Every API response uses one of these shapes — ADR-025 / docs/11 §1:
 *   success: { success: true,  data, meta? }
 *   error:   { success: false, error: { code, message, details? } }
 *
 * `GET /health` is the documented exception (docs/11 §2): it is an
 * infrastructure endpoint and returns a bare object.
 */

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SuccessBody<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

export interface ErrorBody {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: ErrorDetail[]
  }
}

/** Sends a success envelope. */
export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: SuccessBody<T> = { success: true, data }
  return res.status(status).json(body)
}

/** Sends a success envelope with pagination metadata (ADR-012). */
export function okPaginated<T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  status = 200,
): Response {
  const body: SuccessBody<T[]> = { success: true, data: items, meta }
  return res.status(status).json(body)
}

/** Sends an error envelope. Normally called only by the error handler. */
export function fail(
  res: Response,
  code: ErrorCode,
  message: string,
  status: number,
  details?: ErrorDetail[],
): Response {
  const body: ErrorBody = {
    success: false,
    error: details ? { code, message, details } : { code, message },
  }
  return res.status(status).json(body)
}

/** Builds pagination metadata from a total count and the requested page/limit. */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  }
}
