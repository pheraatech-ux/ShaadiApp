import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ employeeId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { employeeId } = await context.params;
    if (!employeeId) {
      return NextResponse.json({ error: "Employee id is required." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Resolve target user ID — try company_employees first, then treat as user_id directly
    let targetUserId: string | null = null;

    const { data: employeeRow } = await supabase
      .from("company_employees")
      .select("user_id")
      .eq("id", employeeId)
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (employeeRow?.user_id) {
      targetUserId = employeeRow.user_id;
    } else {
      targetUserId = employeeId;
    }

    if (!targetUserId || targetUserId === user.id) {
      return NextResponse.json({ error: "Cannot start a conversation with yourself." }, { status: 400 });
    }

    // Find a shared active wedding between current user and target user
    const { data: myWeddingRows } = await supabase
      .from("wedding_members")
      .select("wedding_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const myWeddingIds = (myWeddingRows ?? []).map((r) => r.wedding_id);
    if (!myWeddingIds.length) {
      return NextResponse.json({ error: "No weddings found for your account." }, { status: 400 });
    }

    const { data: targetWeddingRows } = await supabase
      .from("wedding_members")
      .select("wedding_id")
      .eq("user_id", targetUserId)
      .eq("status", "active")
      .in("wedding_id", myWeddingIds);

    const sharedWeddingId = (targetWeddingRows ?? [])[0]?.wedding_id ?? null;
    if (!sharedWeddingId) {
      return NextResponse.json(
        { error: "No shared wedding found with this team member. Add them to a wedding first." },
        { status: 400 },
      );
    }

    const { data: weddingRow } = await supabase
      .from("weddings")
      .select("slug")
      .eq("id", sharedWeddingId)
      .maybeSingle();

    if (!weddingRow) {
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    // Create the thread
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .insert({
        wedding_id: sharedWeddingId,
        title: "Direct chat",
        is_default: false,
        created_by_user_id: user.id,
      })
      .select("id")
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: "Unable to create thread." }, { status: 400 });
    }

    const { error: membershipError } = await supabase.from("message_thread_members").insert([
      { thread_id: thread.id, user_id: user.id, added_by_user_id: user.id },
      { thread_id: thread.id, user_id: targetUserId, added_by_user_id: user.id },
    ]);

    if (membershipError) {
      return NextResponse.json({ error: "Unable to add thread members." }, { status: 400 });
    }

    return NextResponse.json({ threadId: thread.id, weddingSlug: weddingRow.slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create conversation." }, { status: 500 });
  }
}
