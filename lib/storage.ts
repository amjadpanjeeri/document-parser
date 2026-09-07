import { randomUUID } from "node:crypto"

import { getSupabaseAdmin } from "./supabase-admin"

const BUCKET_NAME = "documents"
const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour

/**
 * Upload an original document file to Supabase Storage.
 * Returns the storage path on success, or a graceful error when Supabase
 * isn't configured or the upload fails.
 */
async function uploadDocumentFile(
  file: File,
  originalName: string
): Promise<{ path?: string; error?: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { error: "Storage is not configured" }
  }

  const extension = originalName.includes(".")
    ? originalName.split(".").pop()
    : ""
  const path = `documents/${randomUUID()}${extension ? `.${extension}` : ""}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error("[Storage] Upload error:", error.message)
    return { error: error.message }
  }

  console.log("[Storage] Uploaded:", path)
  return { path }
}

/**
 * Create a short-lived signed URL for a stored file, so private documents can
 * be previewed without exposing the bucket.
 */
async function getDocumentFileUrl(
  path: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS
): Promise<{ url?: string; error?: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { error: "Storage is not configured" }
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSeconds)

  if (error) {
    console.error("[Storage] Signed URL error:", error.message)
    return { error: error.message }
  }

  return { url: data.signedUrl }
}

export { getDocumentFileUrl, uploadDocumentFile }
