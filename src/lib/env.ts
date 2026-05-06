const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KNOCK_API_KEY_SECRET = process.env.KNOCK_API_KEY_SECRET;
const KNOCK_API_KEY_PUBLIC = process.env.KNOCK_API_KEY_PUBLIC;
const KNOCK_WEBHOOK_SECRET = process.env.KNOCK_WEBHOOK_SECRET;
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
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  if (APP_BASE_URL) {
    return APP_BASE_URL.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  throw new Error(
    "Missing app URL. Set APP_URL (or NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL).",
  );
}

export function getKnockServerEnv() {
  if (!KNOCK_API_KEY_SECRET) throw new Error("Missing KNOCK_API_KEY_SECRET");
  return {
    knockApiKeySecret: KNOCK_API_KEY_SECRET,
    knockSigningKey: process.env.KNOCK_SIGNING_KEY,
  };
}

export function getKnockWebhookSecret(): string {
  if (!KNOCK_WEBHOOK_SECRET) throw new Error("Missing KNOCK_WEBHOOK_SECRET");
  return KNOCK_WEBHOOK_SECRET;
}

export function getKnockPublicKey() {
  if (!KNOCK_API_KEY_PUBLIC) throw new Error("Missing KNOCK_API_KEY_PUBLIC");
  return KNOCK_API_KEY_PUBLIC;
}
