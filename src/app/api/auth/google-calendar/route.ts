import { type NextRequest, NextResponse } from "next/server";

import { getAuthUrl, getRedirectUri } from "@/lib/google-calendar/client";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

/** GET /api/auth/google-calendar
 *  Redirects the authenticated user to Google's OAuth consent screen. */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/app/calendar";
  const state = Buffer.from(JSON.stringify({ userId: user.id, returnTo })).toString("base64url");
  const redirectUri = getRedirectUri(request.url);
  const url = getAuthUrl(redirectUri, state);

  return NextResponse.redirect(url);
}
