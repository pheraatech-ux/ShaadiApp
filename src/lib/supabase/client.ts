import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";
import { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
