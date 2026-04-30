import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

// DELETE — delete a session and all its messages (cascade handled by FK).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string; sessionId: string }> },
) {
  const { weddingSlug, sessionId } = await params;
  const supabase = createSupabaseRouteHandlerClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  // Only delete if the session belongs to this user + wedding (row-level ownership check).
  const { error } = await supabase
    .from("ai_chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("wedding_id", wedding.id);

  if (error) return NextResponse.json({ error: "Could not delete session." }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
