import { Router } from "express"

import { authenticate } from "../../middleware/authenticate.js"
import { uploadFiles } from "../../middleware/upload.js"
import { validate } from "../../middleware/validate.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { filesController } from "./files.controller.js"
import {
  downloadQuerySchema,
  fileIdParamSchema,
  listFilesQuerySchema,
} from "./files.schemas.js"

const router = Router()

/**
 * All files endpoints require authentication (DOCS 08, DOCS 11).
 */
router.use(authenticate)

/**
 * POST /api/files/upload
 * Multipart file upload (1–5 files, <=10MB per file)
 */
router.post(
  "/upload",
  uploadFiles,
  asyncHandler(filesController.upload),
)

/**
 * GET /api/files
 * List own files (or all files if admin and scope=all)
 */
router.get(
  "/",
  validate({ query: listFilesQuerySchema }),
  asyncHandler(filesController.list),
)

/**
 * GET /api/files/:id
 * Get file details and extracted text
 */
router.get(
  "/:id",
  validate({ params: fileIdParamSchema }),
  asyncHandler(filesController.getDetails),
)

/**
 * GET /api/files/:id/download
 * Authenticated streaming download or inline preview
 */
router.get(
  "/:id/download",
  validate({ params: fileIdParamSchema, query: downloadQuerySchema }),
  asyncHandler(filesController.download),
)

/**
 * DELETE /api/files/:id
 * Delete file record and remote storage blob
 */
router.delete(
  "/:id",
  validate({ params: fileIdParamSchema }),
  asyncHandler(filesController.deleteFile),
)

export const fileRoutes: Router = router
export default fileRoutes
