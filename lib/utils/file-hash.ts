/**
 * Compute the SHA-256 hash of a file as a lowercase hex string.
 *
 * Used to detect duplicate uploads — the same bytes always produce the same
 * hash, regardless of filename. Requires `crypto.subtle` (available on secure
 * contexts, including localhost); callers should treat failures as "no hash".
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export { computeFileHash }
