import { Router } from "express"

import { authenticate } from "../../middleware/authenticate.js"
import { authorizeRole } from "../../middleware/authorizeRole.js"
import { validate } from "../../middleware/validate.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { usersController } from "./users.controller.js"
import {
  listUsersQuerySchema,
  updateUserRoleSchema,
  userIdParamSchema,
} from "./users.schemas.js"

const router = Router()

/**
 * All user administration endpoints require ADMIN role (DOCS 08, DOCS 22).
 */
router.use(authenticate, authorizeRole("ADMIN"))

/**
 * GET /api/users
 * Paginated list of users with search and role filter
 */
router.get(
  "/",
  validate({ query: listUsersQuerySchema }),
  asyncHandler(usersController.list),
)

/**
 * PATCH /api/users/:id/role
 * Update user role (cannot self-demote)
 */
router.patch(
  "/:id/role",
  validate({ params: userIdParamSchema, body: updateUserRoleSchema }),
  asyncHandler(usersController.updateRole),
)

/**
 * DELETE /api/users/:id
 * Delete user account and cascade delete files (cannot self-delete)
 */
router.delete(
  "/:id",
  validate({ params: userIdParamSchema }),
  asyncHandler(usersController.deleteUser),
)

export const userRoutes: Router = router
export default userRoutes
