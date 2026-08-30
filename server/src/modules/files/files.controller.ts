import type { Request, Response } from "express"

import { AppError } from "../../utils/AppError.js"
import { ok, okPaginated } from "../../utils/response.js"
import type { DownloadQuery, FileIdParam, ListFilesQuery } from "./files.schemas.js"
import { filesService } from "./files.service.js"

/**
 * Files HTTP controller (BE-023..028, docs/11, docs/15).
 */
export const filesController = {
  /**
   * POST /api/files/upload
   */
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const files = (req.files as Express.Multer.File[]) || []
    const outcome = await filesService.uploadFiles(req.user, files)

    ok(res, outcome, 201)
  },

  /**
   * GET /api/files
   */
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const query = (req.query as unknown) as ListFilesQuery
    const { files, meta } = await filesService.listFiles(req.user, query)

    okPaginated(res, files, meta)
  },

  /**
   * GET /api/files/:id
   */
  async getDetails(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as FileIdParam
    const file = await filesService.getFileDetails(req.user, id)

    ok(res, file)
  },

  /**
   * GET /api/files/:id/download
   */
  async download(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as FileIdParam
    const { disposition } = (req.query as unknown) as DownloadQuery

    const { stream, mimeType, originalName, size } =
      await filesService.downloadFile(req.user, id)

    const filenameHeader = encodeURIComponent(originalName)

    res.setHeader("Content-Type", mimeType)
    res.setHeader("Content-Length", size)
    res.setHeader(
      "Content-Disposition",
      `${disposition === "attachment" ? "attachment" : "inline"}; filename*=UTF-8''${filenameHeader}`,
    )

    stream.pipe(res)
  },

  /**
   * DELETE /api/files/:id
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as FileIdParam
    await filesService.deleteFile(req.user, id)

    ok(res, { message: "File deleted successfully" })
  },
}
