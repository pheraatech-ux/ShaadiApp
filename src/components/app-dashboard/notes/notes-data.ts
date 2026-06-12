import { cache } from "react";

import { getPlannerContext } from "@/lib/data/app-data";
import { resolvePersonaFromUser } from "@/lib/employee/persona";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolvePlannerDisplayName } from "@/lib/planner-display";
import type { StickyNote, StickyNotesBoardViewModel } from "@/components/app-dashboard/notes/types";

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

function rowToNote(row: NoteRow, currentUserId: string): StickyNote {
  const profile = row.profiles;
  const parts = [profile?.first_name, profile?.last_name].filter(Boolean);
  const authorLabel = parts.length ? parts.join(" ") : "Team Member";

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    authorUserId: row.author_user_id,
    authorLabel,
    content: row.content,
    color: row.color as StickyNote["color"],
    visibility: row.visibility as StickyNote["visibility"],
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

export const getStickyNotesViewModel = cache(async (): Promise<StickyNotesBoardViewModel> => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, business_name")
    .eq("id", user.id)
    .maybeSingle();

  const currentUserLabel = resolvePlannerDisplayName(profile ?? null, user);

  const { data: rows, error } = await supabase
    .from("sticky_notes")
    .select("id, owner_user_id, author_user_id, content, color, visibility, pinned, pos_x, pos_y, width_pct, height_pct, created_at, updated_at, profiles!sticky_notes_author_user_id_fkey(first_name, last_name)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const all = (rows ?? []).map((row: NoteRow) => rowToNote(row, user.id));
  const publicNotes = all.filter((n) => n.visibility === "public");
  const privateNotes = all.filter((n) => n.visibility === "private");

  return {
    currentUserId: user.id,
    currentUserLabel,
    publicNotes,
    privateNotes,
  };
});
