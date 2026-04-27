import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { body?: string; threadId?: string };
  const messageBody = body.body?.trim();
  const threadId = body.threadId?.trim();
  if (!messageBody || !threadId) {
    return NextResponse.json({ error: "body and threadId are required." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Verify vendor is a member of this thread
  const { data: membership } = await admin
    .from("message_thread_members")
    .select("thread_id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { data: thread } = await admin
    .from("message_threads")
    .select("wedding_id")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  const { data: message, error } = await admin
    .from("messages")
    .insert({
      thread_id: threadId,
      wedding_id: thread.wedding_id,
      author_user_id: user.id,
      body: messageBody,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, message }, { status: 201 });
}
