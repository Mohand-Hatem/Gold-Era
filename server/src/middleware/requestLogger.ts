import type { NextFunction, Request, Response } from "express"

/**
 * Structured request logging (BE-006, P1, NFR-011).
 *
 * Logs exactly four fields: method, path, status, duration. Bodies, headers,
 * cookies, and query strings are never logged — they can contain passwords,
 * OTPs, and tokens (docs/20 §7).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint()

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    console.log(
      `[req] ${req.method} ${req.path} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
    )
  })

  next()
}
