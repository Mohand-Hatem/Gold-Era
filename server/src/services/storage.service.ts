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
 * Opens a readable stream for a stored blob from Cloudinary.
 */
export async function streamBlob(
  storageKey: string,
  resourceType: StorageResourceType,
): Promise<{ stream: Readable; contentType: string | null; contentLength: string | null }> {
  const url = cloudinary.url(storageKey, {
    resource_type: resourceType,
    type: "upload",
    secure: true,
  })

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
