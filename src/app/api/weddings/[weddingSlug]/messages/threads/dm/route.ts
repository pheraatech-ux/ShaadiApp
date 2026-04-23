import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type FindOrCreateDmPayload = {
  targetUserId: string;
};

function getFirstName(firstName: string | null, displayName: string | null): string {
  if (firstName?.trim()) return firstName.trim();
  if (displayName?.trim()) return displayName.trim().split(" ")[0];
  return "Team member";
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as FindOrCreateDmPayload;
    const { targetUserId } = payload;

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (user.id === targetUserId) {
      return NextResponse.json({ error: "Cannot create a DM with yourself." }, { status: 400 });
    }

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id")
      .eq("slug", weddingSlug)
      .maybeSingle();
    if (weddingError || !wedding) {
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    // Fetch non-default thread IDs for this wedding, then their members
    const { data: threadRows, error: threadFetchError } = await supabase
      .from("message_threads")
      .select("id")
      .eq("wedding_id", wedding.id)
      .eq("is_default", false);

    if (threadFetchError) {
      return NextResponse.json({ error: threadFetchError.message }, { status: 400 });
    }

    const threadIds = (threadRows ?? []).map((t) => t.id);

    const { data: allMemberRows, error: membersError } =
      threadIds.length > 0
        ? await supabase
            .from("message_thread_members")
            .select("thread_id, user_id")
            .in("thread_id", threadIds)
        : { data: [], error: null };

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 400 });
    }

    // Group members by thread_id
    const membersByThread = new Map<string, string[]>();
    for (const row of allMemberRows ?? []) {
      const existing = membersByThread.get(row.thread_id) ?? [];
      existing.push(row.user_id);
      membersByThread.set(row.thread_id, existing);
    }

    // Find a thread that has exactly [user.id, targetUserId] as members
    let existingThreadId: string | null = null;
    for (const [threadId, memberIds] of membersByThread) {
      if (
        memberIds.length === 2 &&
        memberIds.includes(user.id) &&
        memberIds.includes(targetUserId)
      ) {
        existingThreadId = threadId;
        break;
      }
    }

    if (existingThreadId) {
      const { data: existingThread } = await supabase
        .from("message_threads")
        .select("id, title, is_default")
        .eq("id", existingThreadId)
        .single();

      return NextResponse.json({
        thread: {
          id: existingThreadId,
          title: existingThread?.title ?? "Direct chat",
          isDefault: false,
          participantIds: [user.id, targetUserId],
          participantCount: 2,
          created: false,
        },
      });
    }

    // Build title from first names
    const [{ data: currentProfile }, { data: targetProfile }] = await Promise.all([
      supabase.from("profiles").select("first_name").eq("id", user.id).maybeSingle(),
      supabase.from("profiles").select("first_name").eq("id", targetUserId).maybeSingle(),
    ]);

    // Fall back to wedding_members display_name for first name derivation
    const { data: memberDisplayRows } = await supabase
      .from("wedding_members")
      .select("user_id, display_name")
      .eq("wedding_id", wedding.id)
      .in("user_id", [user.id, targetUserId]);

    const displayByUserId = new Map((memberDisplayRows ?? []).map((r) => [r.user_id, r.display_name]));

    const currentFirstName = getFirstName(
      currentProfile?.first_name ?? null,
      displayByUserId.get(user.id) ?? null,
    );
    const targetFirstName = getFirstName(
      targetProfile?.first_name ?? null,
      displayByUserId.get(targetUserId) ?? null,
    );

    const title = `${currentFirstName} & ${targetFirstName}`;

    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .insert({
        wedding_id: wedding.id,
        title,
        is_default: false,
        created_by_user_id: user.id,
      })
      .select("id, title, is_default")
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: threadError?.message || "Unable to create thread." }, { status: 400 });
    }

    const { error: membershipError } = await supabase.from("message_thread_members").insert([
      { thread_id: thread.id, user_id: user.id, added_by_user_id: user.id },
      { thread_id: thread.id, user_id: targetUserId, added_by_user_id: user.id },
    ]);

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message || "Unable to assign thread members." }, { status: 400 });
    }

    return NextResponse.json(
      {
        thread: {
          id: thread.id,
          title: thread.title,
          isDefault: false,
          participantIds: [user.id, targetUserId],
          participantCount: 2,
          created: true,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to find or create DM thread." }, { status: 500 });
  }
}
