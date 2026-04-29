import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type Session = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

async function resolveWedding(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  weddingSlug: string,
) {
  const { data } = await supabase.from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  return data;
}

// GET — return all sessions for the user, most-recently-updated first.
// The first item is treated as the "active" session by the client.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;
  const supabase = createSupabaseRouteHandlerClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const wedding = await resolveWedding(supabase, weddingSlug);
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  const { data } = await supabase
    .from("ai_chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("wedding_id", wedding.id)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const sessions = (data ?? []) as Session[];

  return NextResponse.json({
    activeSession: sessions[0] ?? null,
    sessions,
  });
}

// POST — create a new session.
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

  const wedding = await resolveWedding(supabase, weddingSlug);
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
