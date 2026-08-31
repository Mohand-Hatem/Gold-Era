import { randomUUID } from "node:crypto"
import { Readable } from "node:stream"

import type { UploadApiResponse } from "cloudinary"

import { cloudinary } from "../config/cloudinary.js"
import { env } from "../config/env.js"
import { AppError } from "../utils/AppError.js"

/**
 * Blob storage service using Cloudinary (BE-020, ADR-039).
 */

export type StorageResourceType = "image" | "raw"

export interface StoredBlob {
  storageKey: string
  secureUrl: string
  resourceType: StorageResourceType
  bytes: number
}

/** Chooses the Cloudinary resource type for a MIME type. */
export function resourceTypeFor(mimeType: string): StorageResourceType {
  return mimeType.startsWith("image/") ? "image" : "raw"
}

export interface UploadSignature {
  storageKey: string
  resourceType: StorageResourceType
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  format?: string
  uploadUrl: string
}

/**
 * Produces a Cloudinary signature for a direct browser-to-Cloudinary upload
 * (ADR-011 follow-up, Vercel migration).
 *
 * Vercel Functions cap request bodies at 4.5 MB, which is below the 10 MB
 * per-file limit (ADR-002). Routing bytes through the function is no longer
 * possible, so the browser uploads straight to Cloudinary instead, using a
 * short-lived signature scoped to a server-chosen `public_id`. The client
 * cannot alter a signed parameter without invalidating the signature, so this
 * grants upload of exactly one object at exactly the path the server names —
 * nothing else.
 *
 * The uploaded blob is not yet a `File` row and is not validated against real
 * bytes at this point (extension/MIME allowlist and magic-byte sniffing still
 * require the actual content, which is fetched back and checked in
 * `confirmUploads`, see files.service.ts). Until that check passes, an
 * unvalidated blob can exist in Cloudinary with no corresponding database
 * record, and is therefore unreachable through the API.
 */
export function signUpload(extension: string, mimeType: string): UploadSignature {
  const resourceType = resourceTypeFor(mimeType)
  const sanitizedExt = extension.replace(/^\./, "")
  const storageKey = `${env.CLOUDINARY_FOLDER}/${randomUUID()}`
  const timestamp = Math.floor(Date.now() / 1000)

  // Every parameter the client sends (besides file, cloud_name, resource_type,
  // api_key, signature) must be included here, or Cloudinary rejects the
  // signature as a mismatch.
  const paramsToSign: Record<string, string | number> = {
    public_id: storageKey,
    timestamp,
    type: "upload",
  }
  if (sanitizedExt) {
    paramsToSign.format = sanitizedExt
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  )

  return {
    storageKey,
    resourceType,
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    format: sanitizedExt || undefined,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
  }
}

/** Uploads a buffer to Cloudinary and returns its storage key and secure URL. */
export async function uploadBlob(
  buffer: Buffer,
  extension: string,
  mimeType: string,
): Promise<StoredBlob> {
  const resourceType = resourceTypeFor(mimeType)
  const sanitizedExt = extension.replace(/^\./, "")
  const publicId = `${env.CLOUDINARY_FOLDER}/${randomUUID()}`

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        format: sanitizedExt || undefined,
        type: "upload",
        overwrite: false,
        use_filename: false,
        unique_filename: false,
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error ?? new Error("Cloudinary upload returned no result"))
          return
        }
        resolve(uploaded)
      },
    )

    Readable.from(buffer).pipe(stream)
  })

  return {
    storageKey: result.public_id,
    secureUrl: result.secure_url,
    resourceType,
    bytes: result.bytes,
  }
}

/**
 * Builds the public Cloudinary delivery URL for a stored blob.
 *
 * `attachmentFilename`, when given, adds Cloudinary's `fl_attachment:<name>`
 * flag so the browser downloads under the file's original name instead of
 * its opaque storage key.
 */
export function deliveryUrlFor(
  storageKey: string,
  resourceType: StorageResourceType,
  options: { attachmentFilename?: string } = {},
): string {
  return cloudinary.url(storageKey, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
    flags: options.attachmentFilename
      ? `attachment:${options.attachmentFilename}`
      : undefined,
  })
}

/**
 * Opens a readable stream for a stored blob from Cloudinary.
 */
export async function streamBlob(
  storageKey: string,
  resourceType: StorageResourceType,
): Promise<{ stream: Readable; contentType: string | null; contentLength: string | null }> {
  const url = deliveryUrlFor(storageKey, resourceType)

  const response = await fetch(url)

  if (!response.ok || !response.body) {
    console.error(`[storage] fetch failed for ${storageKey} (${url}): status ${response.status}`)
    throw AppError.notFound("ERR_FILE_NOT_FOUND", "Stored file is no longer available in storage provider")
  }

  return {
    stream: Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length"),
  }
}

/**
 * Fetches a stored blob's full contents into memory.
 *
 * Used to validate a directly-uploaded blob against its real bytes
 * (`confirmUploads` in files.service.ts) — magic-byte sniffing and text
 * extraction both need the complete buffer, and there is no smaller check
 * that would substitute for it.
 */
export async function fetchBlobBuffer(
  storageKey: string,
  resourceType: StorageResourceType,
): Promise<Buffer> {
  const url = deliveryUrlFor(storageKey, resourceType)

  const response = await fetch(url)

  if (!response.ok) {
    console.error(`[storage] fetch failed for ${storageKey} (${url}): status ${response.status}`)
    throw AppError.notFound("ERR_FILE_NOT_FOUND", "Uploaded file could not be retrieved from storage provider")
  }

  return Buffer.from(await response.arrayBuffer())
}

/** Deletes a stored blob from Cloudinary. */
export async function removeBlob(
  storageKey: string,
  resourceType: StorageResourceType,
): Promise<void> {
  await cloudinary.uploader.destroy(storageKey, {
    resource_type: resourceType,
    type: "upload",
    invalidate: true,
  })
}

/** Deletes multiple blobs, tolerating individual failures. */
export async function removeBlobs(
  blobs: Array<{ storageKey: string; resourceType: StorageResourceType }>,
): Promise<{ removed: number; failed: number }> {
  if (blobs.length === 0) return { removed: 0, failed: 0 }

  const results = await Promise.allSettled(
    blobs.map((blob) => removeBlob(blob.storageKey, blob.resourceType)),
  )

  let removed = 0
  let failed = 0

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      removed += 1
    } else {
      failed += 1
      console.error(`[storage] failed to remove ${blobs[index]?.storageKey}:`, result.reason)
    }
  })

  return { removed, failed }
}
