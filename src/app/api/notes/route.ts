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
  created_at: string;
  updated_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

function buildAuthorLabel(profile: NoteRow["profiles"], fallback: string): string {
  if (!profile) return fallback;
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : fallback;
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const tab = request.nextUrl.searchParams.get("tab") ?? "public";
  const visibility = tab === "private" ? "private" : "public";

  const { data, error } = await supabase
    .from("sticky_notes")
    .select("id, owner_user_id, author_user_id, content, color, visibility, pinned, created_at, updated_at, profiles!sticky_notes_author_user_id_fkey(first_name, last_name)")
    .eq("visibility", visibility)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const notes = (data ?? []).map((row: NoteRow) => ({
    id: row.id,
    ownerUserId: row.owner_user_id,
    authorUserId: row.author_user_id,
    authorLabel: buildAuthorLabel(row.profiles, "Team Member"),
    content: row.content,
    color: row.color as "yellow" | "pink" | "blue" | "green" | "purple",
    visibility: row.visibility as "public" | "private",
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isCurrentUser: row.author_user_id === user.id,
  }));

  return NextResponse.json({ notes });
}

type CreatePayload = {
  content?: string;
  color?: string;
  visibility?: string;
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

  // Resolve owner_user_id: for employees, it's their planner's id; for planners, their own id
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
    })
    .select("id, owner_user_id, author_user_id, content, color, visibility, pinned, created_at, updated_at")
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
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isCurrentUser: true,
    },
  });
}
