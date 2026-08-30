import type { Request, Response } from "express"

import { AppError } from "../../utils/AppError.js"
import { ok, okPaginated } from "../../utils/response.js"
import type {
  ListUsersQuery,
  UpdateUserRoleInput,
  UserIdParam,
} from "./users.schemas.js"
import { usersService } from "./users.service.js"

/**
 * Users management HTTP controller (BE-029..031, docs/11, docs/22).
 */
export const usersController = {
  /**
   * GET /api/users
   */
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const query = req.query as unknown as ListUsersQuery
    const { users, meta } = await usersService.listUsers(query)

    okPaginated(res, users, meta)
  },

  /**
   * PATCH /api/users/:id/role
   */
  async updateRole(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as UserIdParam
    const { role } = req.body as UpdateUserRoleInput

    const updatedUser = await usersService.updateUserRole(req.user, id, role)

    ok(res, updatedUser)
  },

  /**
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as UserIdParam
    await usersService.deleteUser(req.user, id)

    ok(res, { message: "User deleted successfully" })
  },
}
