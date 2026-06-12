import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { resolvePersonaFromUser } from "@/lib/employee/persona";

type NoteRow = {
  id: string;
  owner_user_id: string;
  author_user_id: string;
  content: string;
  color: string;
  visibility: string;
  pinned: boolean;
  pos_x: number | null;
  pos_y: number | null;
  width_pct: number | null;
  height_pct: number | null;
  created_at: string;
  updated_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

function buildAuthorLabel(profile: NoteRow["profiles"], fallback: string): string {
  if (!profile) return fallback;
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : fallback;
}

function rowToNote(row: NoteRow, currentUserId: string) {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    authorUserId: row.author_user_id,
    authorLabel: buildAuthorLabel(row.profiles, "Team Member"),
    content: row.content,
    color: row.color as "yellow" | "pink" | "blue" | "green" | "purple",
    visibility: row.visibility as "public" | "private",
    pinned: row.pinned,
    posX: row.pos_x,
    posY: row.pos_y,
    widthPct: row.width_pct,
    heightPct: row.height_pct,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isCurrentUser: row.author_user_id === currentUserId,
  };
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const tab = request.nextUrl.searchParams.get("tab") ?? "public";
  const visibility = tab === "private" ? "private" : "public";

  const { data, error } = await supabase
    .from("sticky_notes")
    .select("id, owner_user_id, author_user_id, content, color, visibility, pinned, pos_x, pos_y, width_pct, height_pct, created_at, updated_at, profiles!sticky_notes_author_user_id_fkey(first_name, last_name)")
    .eq("visibility", visibility)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notes: (data ?? []).map((row: NoteRow) => rowToNote(row, user.id)) });
}

type CreatePayload = {
  content?: string;
  color?: string;
  visibility?: string;
  posX?: number;
  posY?: number;
  widthPct?: number;
  heightPct?: number;
};

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const payload = (await request.json()) as CreatePayload;
  const content = payload.content?.trim() ?? "";
  const color = ["yellow", "pink", "blue", "green", "purple"].includes(payload.color ?? "")
    ? (payload.color as string)
    : "yellow";
  const visibility = payload.visibility === "private" ? "private" : "public";
  const posX = typeof payload.posX === "number" ? payload.posX : null;
  const posY = typeof payload.posY === "number" ? payload.posY : null;
  const widthPct = typeof payload.widthPct === "number" ? payload.widthPct : null;
  const heightPct = typeof payload.heightPct === "number" ? payload.heightPct : null;

  const persona = resolvePersonaFromUser(user);
  let ownerUserId = user.id;

  if (persona === "employee") {
    const { data: empRow } = await supabase
      .from("company_employees")
      .select("owner_user_id")
      .eq("user_id", user.id)
      .eq("employment_status", "active")
      .maybeSingle();
    if (empRow?.owner_user_id) ownerUserId = empRow.owner_user_id;
  }

  const { data, error } = await supabase
    .from("sticky_notes")
    .insert({
      owner_user_id: ownerUserId,
      author_user_id: user.id,
      content,
      color,
      visibility,
      pos_x: posX,
      pos_y: posY,
      width_pct: widthPct,
      height_pct: heightPct,
    })
    .select("id, owner_user_id, author_user_id, content, color, visibility, pinned, pos_x, pos_y, width_pct, height_pct, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    note: {
      id: data.id,
      ownerUserId: data.owner_user_id,
      authorUserId: data.author_user_id,
      authorLabel: "You",
      content: data.content,
      color: data.color,
      visibility: data.visibility,
      pinned: data.pinned,
      posX: data.pos_x,
      posY: data.pos_y,
      widthPct: data.width_pct,
      heightPct: data.height_pct,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isCurrentUser: true,
    },
  });
}
