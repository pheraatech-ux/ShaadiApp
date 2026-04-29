import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
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

  const { data: session, error } = await supabase
    .from("ai_chat_sessions")
    .insert({ wedding_id: wedding.id, user_id: user.id })
    .select("id")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Could not create session." }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id }, { status: 201 });
}
