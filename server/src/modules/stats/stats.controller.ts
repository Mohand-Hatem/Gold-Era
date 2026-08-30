import type { Request, Response } from "express"

import { AppError } from "../../utils/AppError.js"
import { ok } from "../../utils/response.js"
import { statsService } from "./stats.service.js"

/**
 * Statistics HTTP controller (BE-032..033, docs/11, docs/21).
 */
export const statsController = {
  /**
   * GET /api/stats/me
   */
  async getUserStats(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const stats = await statsService.getUserStats(req.user.id)
    ok(res, stats)
  },

  /**
   * GET /api/stats/admin
   */
  async getAdminStats(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const stats = await statsService.getAdminStats()
    ok(res, stats)
  },
}
