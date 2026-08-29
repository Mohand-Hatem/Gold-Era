import type { NextFunction, Request, Response } from "express"

import { AppError } from "../utils/AppError"

/**
 * Catches requests that matched no route and converts them into a standard
 * 404 envelope (BE-004, docs/19 §3).
 *
 * Mounted after all routers and before the error handler.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound("ERR_NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`))
}
