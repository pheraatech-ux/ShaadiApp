import { createClient } from "@supabase/supabase-js"

import { getSupabaseEnv } from "@/lib/env"
import type { Database } from "@/types/database"

let adminClient: ReturnType<typeof createSupabaseAdminClient> | undefined

function createSupabaseAdminClient() {
  const { supabaseUrl } = getSupabaseEnv()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set this server-only env var to use OTP infrastructure.",
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function getSupabaseAdminClient() {
  if (!adminClient) {
    adminClient = createSupabaseAdminClient()
  }

  return adminClient
}
