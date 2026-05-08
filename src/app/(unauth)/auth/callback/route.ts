import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { deriveProfileNameFieldsFromUser } from "@/lib/auth/profile-name";
import { getSupabaseEnv } from "@/lib/env";
import { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const tokenType = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/app";
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  if (!code && !(tokenHash && tokenType)) {
    return NextResponse.redirect(new URL("/auth", requestUrl.origin));
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  let error: Error | null = null;
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    error = exchangeError;
  } else if (tokenHash && tokenType) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tokenType as EmailOtpType,
    });
    error = verifyError;
  }

  if (error) {
    return NextResponse.redirect(new URL("/auth", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const { firstName, lastName } = deriveProfileNameFieldsFromUser(user);
    const businessName =
      typeof metadata.business_name === "string" && metadata.business_name.trim()
        ? metadata.business_name.trim()
        : null;
    const phone =
      typeof metadata.phone === "string" && metadata.phone.trim() ? metadata.phone.trim() : null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        phone,
      },
      { onConflict: "id" },
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
