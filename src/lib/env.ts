const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_BASE_URL = process.env.APP_URL;

export function getSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  };
}

export function getAppBaseUrl(fallbackOrigin?: string) {
  if (process.env.NODE_ENV !== "production") {
    if (fallbackOrigin) {
      return fallbackOrigin.replace(/\/+$/, "");
    }

    return "http://localhost:3000";
  }

  if (APP_BASE_URL) {
    return APP_BASE_URL.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/+$/, "");
  }

  throw new Error(
    "Missing app URL. Set APP_URL (or NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL).",
  );
}
