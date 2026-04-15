import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type CreateThreadPayload = {
  title?: string;
  participantIds?: string[];
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as CreateThreadPayload;
    const requestedParticipantIds = [...new Set(payload.participantIds ?? [])].filter(Boolean);
    if (!requestedParticipantIds.length) {
      return NextResponse.json({ error: "Select at least one team member." }, { status: 400 });
    }

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

    const participantIds = [...new Set([user.id, ...requestedParticipantIds])];
    const { data: validMembers, error: memberError } = await supabase
      .from("wedding_members")
      .select("user_id")
      .eq("wedding_id", wedding.id)
      .eq("status", "active")
      .in("user_id", participantIds);

    if (memberError) {
      return NextResponse.json({ error: memberError.message || "Unable to validate members." }, { status: 400 });
    }

    const validMemberIds = new Set((validMembers ?? []).map((member) => member.user_id).filter(Boolean) as string[]);
    if (participantIds.some((id) => !validMemberIds.has(id))) {
      return NextResponse.json({ error: "One or more members are not active on this wedding." }, { status: 400 });
    }

    const title = payload.title?.trim() || (participantIds.length <= 2 ? "Direct chat" : `Group chat (${participantIds.length})`);
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .insert({
        wedding_id: wedding.id,
        title,
        is_default: false,
        created_by_user_id: user.id,
      })
      .select("id, title, is_default, created_at")
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: threadError?.message || "Unable to create thread." }, { status: 400 });
    }

    const membershipRows = participantIds.map((participantId) => ({
      thread_id: thread.id,
      user_id: participantId,
      added_by_user_id: user.id,
    }));
    const { error: membershipError } = await supabase.from("message_thread_members").insert(membershipRows);
    if (membershipError) {
      return NextResponse.json({ error: membershipError.message || "Unable to assign thread members." }, { status: 400 });
    }

    return NextResponse.json(
      {
        thread: {
          id: thread.id,
          title: thread.title,
          isDefault: thread.is_default,
          participantIds,
          participantCount: participantIds.length,
          messageCount: 0,
          lastMessageAt: null,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to create thread." }, { status: 500 });
  }
}
