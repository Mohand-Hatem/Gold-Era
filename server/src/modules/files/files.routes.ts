import { Router } from "express"

import { authenticate } from "../../middleware/authenticate.js"
import { validate } from "../../middleware/validate.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { filesController } from "./files.controller.js"
import {
  confirmUploadsSchema,
  downloadQuerySchema,
  fileIdParamSchema,
  listFilesQuerySchema,
  requestUploadSignaturesSchema,
} from "./files.schemas.js"

const router = Router()

/**
 * All files endpoints require authentication (DOCS 08, DOCS 11).
 */
router.use(authenticate)

/**
 * POST /api/files/upload-signature
 * Step 1 of the direct-to-Cloudinary upload flow (1–5 files, <=10MB per
 * file): declare intent, get a signature per file. Bytes never pass through
 * this API — Vercel Functions cap request bodies at 4.5 MB, well under the
 * 10 MB per-file limit (ADR-002).
 */
router.post(
  "/upload-signature",
  validate({ body: requestUploadSignaturesSchema }),
  asyncHandler(filesController.uploadSignature),
)

/**
 * POST /api/files/confirm
 * Step 2: the browser has uploaded directly to Cloudinary; validate the
 * real bytes and persist the file records.
 */
router.post(
  "/confirm",
  validate({ body: confirmUploadsSchema }),
  asyncHandler(filesController.confirmUpload),
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
