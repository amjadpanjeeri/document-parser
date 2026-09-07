import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let cachedClient: SupabaseClient | null = null

/**
 * Server-side Supabase client using the service role key, which bypasses RLS.
 * Returns null when Supabase isn't configured — storage features then degrade
 * gracefully (documents are extracted and saved without a stored file).
 */
function getSupabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  }
  return cachedClient
}

export { getSupabaseAdmin }
