import { Router } from "express"

import { authenticate } from "../../middleware/authenticate.js"
import { authorizeRole } from "../../middleware/authorizeRole.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { statsController } from "./stats.controller.js"

const router = Router()

/**
 * All statistics endpoints require authentication (DOCS 08, DOCS 21).
 */
router.use(authenticate)

/**
 * GET /api/stats/me
 * User personal dashboard statistics
 */
router.get("/me", asyncHandler(statsController.getUserStats))

/**
 * GET /api/stats/admin
 * Admin system-wide dashboard statistics & activity trend
 */
router.get(
  "/admin",
  authorizeRole("ADMIN"),
  asyncHandler(statsController.getAdminStats),
)

export const statsRoutes: Router = router
export default statsRoutes
