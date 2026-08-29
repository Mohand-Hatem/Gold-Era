import type { NextFunction, Request, RequestHandler, Response } from "express"
import { ZodError, type ZodType } from "zod"

import { AppError, type ErrorDetail } from "../utils/AppError"

/**
 * Request validation middleware (BE-005).
 *
 * Backend validation is authoritative — frontend validation is UX only
 * (docs/18, CON-05). Parsed values are written back onto the request so
 * handlers receive coerced, stripped, fully typed input.
 */

export interface ValidationSchemas {
  body?: ZodType
  query?: ZodType
  params?: ZodType
}

type ValidationTarget = keyof ValidationSchemas

function toDetails(error: ZodError, target: ValidationTarget): ErrorDetail[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".")
    return {
      field: path ? `${target}.${path}` : target,
      message: issue.message,
    }
  })
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const details: ErrorDetail[] = []

    for (const target of ["body", "query", "params"] as const) {
      const schema = schemas[target]
      if (!schema) continue

      const result = schema.safeParse(req[target])

      if (result.success) {
        // Assign the parsed value so downstream handlers get coerced types and
        // unknown keys stripped. Express 5 exposes `query` via a getter, so it
        // is redefined rather than assigned.
        if (target === "query") {
          Object.defineProperty(req, "query", {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true,
          })
        } else {
          req[target] = result.data as never
        }
      } else {
        details.push(...toDetails(result.error, target))
      }
    }

    if (details.length > 0) {
      next(AppError.validation(details))
      return
    }

    next()
  }
}
