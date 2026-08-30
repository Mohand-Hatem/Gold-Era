import type { Role } from "@prisma/client"
import type { NextFunction, Request, RequestHandler, Response } from "express"

import { AppError } from "../utils/AppError.js"

/**
 * Role-based authorization (BE-015, AUTH-010, docs/08).
 *
 * Must be mounted after `authenticate`, which populates `req.user`. This is the
 * real admin boundary — the frontend's admin route guard only hides navigation.
 *
 * Usage: `router.get("/", authenticate, authorizeRole("ADMIN"), handler)`
 */
export function authorizeRole(...allowed: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Mounted without `authenticate` in front of it, or the token was rejected.
      next(AppError.unauthenticated())
      return
    }

    if (!allowed.includes(req.user.role)) {
      next(AppError.forbidden())
      return
    }

    next()
  }
}
