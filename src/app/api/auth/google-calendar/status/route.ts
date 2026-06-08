import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

/** GET /api/auth/google-calendar/status
 *  Returns the current user's Google Calendar connection status. */
export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ connected: false });
  }

  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("connected_email, connected_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    connected: Boolean(data),
    email: data?.connected_email ?? null,
    connectedAt: data?.connected_at ?? null,
  });
}
