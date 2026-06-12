import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type PatchPayload = {
  content?: string;
  color?: string;
  pinned?: boolean;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const payload = (await request.json()) as PatchPayload;

  type StickyNoteUpdate = {
    content?: string;
    color?: string;
    pinned?: boolean;
  };

  const updates: StickyNoteUpdate = {};

  if (typeof payload.content === "string") updates.content = payload.content.trim();
  if (typeof payload.color === "string" && ["yellow", "pink", "blue", "green", "purple"].includes(payload.color)) {
    updates.color = payload.color;
  }
  if (typeof payload.pinned === "boolean") updates.pinned = payload.pinned;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sticky_notes")
    .update(updates)
    .eq("id", id)
    .eq("author_user_id", user.id)
    .select("id, content, color, pinned, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Note not found or not authorised." }, { status: 404 });

  return NextResponse.json({ note: data });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { error } = await supabase
    .from("sticky_notes")
    .delete()
    .eq("id", id)
    .eq("author_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
