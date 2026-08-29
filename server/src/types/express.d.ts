import type { Role } from "@prisma/client"

/**
 * Augments Express's Request with the authenticated principal.
 *
 * Populated by `middleware/authenticate` after a valid session is proven, and
 * read by `middleware/authorizeRole` (RBAC) and by file ownership checks in
 * Phase 5. Optional because public routes never set it.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: Role
        tokenVersion: number
      }
    }
  }
}

export {}
