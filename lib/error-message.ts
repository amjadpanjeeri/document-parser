/**
 * Turn a raw technical error into wording a user can understand and act on.
 * Keeps already-friendly messages (validation errors from the API) as-is.
 */
function toUserMessage(
  raw: string | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  if (!raw) return fallback

  // Database connectivity problems — the most common silent failure here.
  if (
    /database unavailable|mongodb|ECONNREFUSED|ENOTFOUND|querySrv|network error|failed to fetch/i.test(
      raw
    )
  ) {
    return "The database isn't reachable right now. Your changes may not be saved — please check your connection and try again."
  }

  // API validation messages are already written for end users — pass through.
  return raw
}

export { toUserMessage }
