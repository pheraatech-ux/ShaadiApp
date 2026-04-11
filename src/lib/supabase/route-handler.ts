import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Route Handlers: session cookies come from the incoming
 * `NextRequest`. Using only `cookies()` from `next/headers` can omit cookies in
 * some POST handlers, so `auth.uid()` is null and RLS rejects inserts.
 */
export function createSupabaseRouteHandlerClient(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Session refresh is handled in middleware / other flows; avoid losing
        // Set-Cookie on plain JSON responses here.
      },
    },
  });
}
