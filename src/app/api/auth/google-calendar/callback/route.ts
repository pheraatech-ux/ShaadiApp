import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

import { exchangeCode, buildAuthedClient, getRedirectUri } from "@/lib/google-calendar/client";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

/** GET /api/auth/google-calendar/callback
 *  Handles the OAuth redirect from Google, stores tokens, and redirects back. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  let returnTo = "/app/calendar";
  try {
    if (state) {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString()) as {
        returnTo?: string;
      };
      returnTo = parsed.returnTo ?? "/app/calendar";
    }
  } catch {}

  if (errorParam || !code) {
    return NextResponse.redirect(
      new URL(`${returnTo}?gcal_error=${errorParam ?? "no_code"}`, request.url),
    );
  }

  try {
    const redirectUri = getRedirectUri(request.url);
    const tokens = await exchangeCode(code, redirectUri);

    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL(`/auth?next=${returnTo}`, request.url));
    }

    // Fetch the primary calendar to get the user's Google email
    let connectedEmail: string | null = null;
    try {
      const authClient = buildAuthedClient(tokens, redirectUri);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cal = google.calendar({ version: "v3", auth: authClient as any });
      const { data: primary } = await cal.calendarList.get({ calendarId: "primary" });
      connectedEmail = primary.id ?? null;
    } catch {
      // Non-fatal — email is cosmetic
    }

    await supabase.from("google_calendar_tokens").upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expiry_date: tokens.expiry_date ?? null,
        scope: tokens.scope ?? null,
        token_type: tokens.token_type ?? "Bearer",
        connected_email: connectedEmail,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    return NextResponse.redirect(
      new URL(`${returnTo}?gcal_connected=1`, request.url),
    );
  } catch (err) {
    console.error("[google-calendar/callback]", err);
    return NextResponse.redirect(
      new URL(`${returnTo}?gcal_error=callback_failed`, request.url),
    );
  }
}
