import type { Request, Response } from "express"

import { AppError } from "../../utils/AppError.js"
import { ok, okPaginated } from "../../utils/response.js"
import type {
  ConfirmUploadsInput,
  DownloadQuery,
  FileIdParam,
  ListFilesQuery,
  RequestUploadSignaturesInput,
} from "./files.schemas.js"
import { filesService } from "./files.service.js"

/**
 * Files HTTP controller (BE-023..028, docs/11, docs/15).
 */
export const filesController = {
  /**
   * POST /api/files/upload-signature
   *
   * First step of the direct-to-Cloudinary upload flow (docs/24, Vercel
   * migration): declares intent to upload and receives a signature per file.
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- asyncHandler requires a Promise-returning signature
  async uploadSignature(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const result = filesService.createUploadSignatures(req.body as RequestUploadSignaturesInput)
    ok(res, result, 201)
  },

  /**
   * POST /api/files/confirm
   *
   * Second step: the client has finished uploading directly to Cloudinary
   * and hands back the storage keys for validation and persistence.
   */
  async confirmUpload(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const outcome = await filesService.confirmUploads(req.user, req.body as ConfirmUploadsInput)
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
   *
   * Redirects to the Cloudinary delivery URL rather than streaming bytes
   * through this API — see `filesService.downloadFile` for why (Vercel
   * migration: response bodies are capped at 4.5 MB).
   */
  async download(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthenticated()
    }

    const { id } = req.params as unknown as FileIdParam
    const { disposition } = (req.query as unknown) as DownloadQuery

    const { url } = await filesService.downloadFile(req.user, id, disposition)

    res.redirect(302, url)
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
