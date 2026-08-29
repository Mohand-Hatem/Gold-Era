import type { NextFunction, Request, RequestHandler, Response } from "express"

/**
 * Wraps an async route handler so rejected promises reach the central error
 * handler instead of becoming unhandled rejections (BE-003).
 *
 * Express 5 forwards rejected promises automatically, but wrapping keeps the
 * behaviour explicit and portable, and gives controllers a single consistent
 * shape.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}
