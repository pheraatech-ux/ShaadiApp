import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { WeddingMessageItem } from "@/components/wedding-workspace/messages/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const supabase = createSupabaseRouteHandlerClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id")
      .eq("slug", weddingSlug)
      .maybeSingle();

    if (weddingError || !wedding) {
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    const { data: messageRows, error: messageError } = await supabase
      .from("messages")
      .select("id, body, created_at, author_user_id, thread_id")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 400 });
    }

    const rawMessages = (messageRows ?? []) as {
      id: string;
      body: string;
      created_at: string;
      author_user_id: string | null;
      thread_id: string;
    }[];

    const authorUserIds = [...new Set(rawMessages.map((m) => m.author_user_id).filter(Boolean))] as string[];

    const [{ data: profileRows }, { data: memberRows }] = await Promise.all([
      authorUserIds.length > 0
        ? supabase.from("profiles").select("id, first_name, last_name").in("id", authorUserIds)
        : Promise.resolve({ data: [] as { id: string; first_name: string | null; last_name: string | null }[] }),
      supabase
        .from("wedding_members")
        .select("user_id, display_name, invited_email")
        .eq("wedding_id", wedding.id)
        .neq("status", "removed"),
    ]);

    const memberDisplayByUserId = new Map<string, string>();
    for (const member of memberRows ?? []) {
      if (member.user_id) {
        memberDisplayByUserId.set(member.user_id, member.display_name || member.invited_email || "Team member");
      }
    }

    const displayNameByUserId = new Map<string, string>();
    for (const profile of profileRows ?? []) {
      const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Team member";
      displayNameByUserId.set(profile.id, name);
    }

    const messages: WeddingMessageItem[] = rawMessages.map((message) => {
      const authorLabel = message.author_user_id
        ? displayNameByUserId.get(message.author_user_id) ||
          memberDisplayByUserId.get(message.author_user_id) ||
          "Team member"
        : "System";
      return {
        id: message.id,
        threadId: message.thread_id,
        body: message.body,
        createdAt: message.created_at,
        authorUserId: message.author_user_id,
        authorLabel,
        authorInitials: getInitials(authorLabel),
        isCurrentUser: message.author_user_id === user.id,
      };
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Unable to fetch messages." }, { status: 500 });
  }
}
