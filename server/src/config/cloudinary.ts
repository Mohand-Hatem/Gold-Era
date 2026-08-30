import { v2 as cloudinary } from "cloudinary"

import { env } from "./env.js"

/**
 * Cloudinary SDK configuration (BE-020, ADR-039).
 *
 * Credentials come from the validated environment, so a missing or empty value
 * already aborts startup in `config/env.ts` rather than failing on the first
 * upload attempt.
 *
 * `secure: true` forces https URLs for every generated link.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }
export default cloudinary
