import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVendorPortalContext } from "@/lib/vendor/context";
import { getOrCreateVendorThread } from "@/lib/vendor/thread";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { body?: string; threadId?: string };
  const messageBody = body.body?.trim();
  if (!messageBody) return NextResponse.json({ error: "body is required." }, { status: 400 });

  const admin = getSupabaseAdminClient();
  let resolvedThreadId = body.threadId?.trim();
  let weddingId: string;

  if (resolvedThreadId) {
    // Verify vendor is a member of this thread
    const { data: membership } = await admin
      .from("message_thread_members")
      .select("thread_id")
      .eq("thread_id", resolvedThreadId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

    const { data: thread } = await admin
      .from("message_threads")
      .select("wedding_id")
      .eq("id", resolvedThreadId)
      .maybeSingle();

    if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    weddingId = thread.wedding_id;
  } else {
    // First message — resolve vendor context and create the thread
    const ctx = await getVendorPortalContext();
    if (!ctx) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    resolvedThreadId = await getOrCreateVendorThread(admin, ctx.weddingId, ctx.userId, ctx.ownerUserId);
    weddingId = ctx.weddingId;
  }

  const { data: message, error } = await admin
    .from("messages")
    .insert({
      thread_id: resolvedThreadId,
      wedding_id: weddingId,
      author_user_id: user.id,
      body: messageBody,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, threadId: resolvedThreadId, message }, { status: 201 });
}
