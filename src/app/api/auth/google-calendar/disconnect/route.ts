import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

/** POST /api/auth/google-calendar/disconnect
 *  Removes the user's stored Google Calendar tokens and clears cached events. */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await Promise.all([
    supabase.from("google_calendar_tokens").delete().eq("user_id", user.id),
    supabase.from("google_calendar_cached_events").delete().eq("user_id", user.id),
  ]);

  return NextResponse.json({ success: true });
}
