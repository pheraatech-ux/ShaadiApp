import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type PatchPayload = {
  content?: string;
  color?: string;
  pinned?: boolean;
  posX?: number;
  posY?: number;
  widthPct?: number;
  heightPct?: number;
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
    pos_x?: number;
    pos_y?: number;
    width_pct?: number;
    height_pct?: number;
  };

  const updates: StickyNoteUpdate = {};

  if (typeof payload.content === "string") updates.content = payload.content.trim();
  if (typeof payload.color === "string" && ["yellow", "pink", "blue", "green", "purple"].includes(payload.color)) {
    updates.color = payload.color;
  }
  if (typeof payload.pinned === "boolean") updates.pinned = payload.pinned;
  if (typeof payload.posX === "number") updates.pos_x = payload.posX;
  if (typeof payload.posY === "number") updates.pos_y = payload.posY;
  if (typeof payload.widthPct === "number") updates.width_pct = payload.widthPct;
  if (typeof payload.heightPct === "number") updates.height_pct = payload.heightPct;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const isLayoutOnly =
    updates.pos_x !== undefined ||
    updates.pos_y !== undefined ||
    updates.width_pct !== undefined ||
    updates.height_pct !== undefined
      ? updates.content === undefined &&
        updates.color === undefined &&
        updates.pinned === undefined
      : false;

  if (isLayoutOnly) {
    const { data: existing, error: fetchError } = await supabase
      .from("sticky_notes")
      .select("id, visibility, author_user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const isAuthor = existing.author_user_id === user.id;
    if (!isAuthor && existing.visibility !== "public") {
      return NextResponse.json({ error: "Not authorised." }, { status: 403 });
    }
  }

  let query = supabase.from("sticky_notes").update(updates).eq("id", id);
  if (!isLayoutOnly) {
    query = query.eq("author_user_id", user.id);
  }

  const { data, error } = await query
    .select("id, content, color, pinned, pos_x, pos_y, width_pct, height_pct, updated_at")
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
