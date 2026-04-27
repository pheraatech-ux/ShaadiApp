import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { body?: string };
  const commentBody = body.body?.trim();
  if (!commentBody) return NextResponse.json({ error: "Comment body is required." }, { status: 400 });

  const admin = getSupabaseAdminClient();

  const { data: task } = await admin
    .from("tasks")
    .select("id, wedding_id, assignee_user_ids")
    .eq("id", taskId)
    .maybeSingle();

  if (!task || !task.assignee_user_ids.includes(user.id)) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const { data: vendor } = await admin
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .eq("wedding_id", task.wedding_id)
    .eq("invite_status", "active")
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { data: comment, error } = await admin
    .from("task_comments")
    .insert({
      task_id: taskId,
      wedding_id: task.wedding_id,
      author_user_id: user.id,
      body: commentBody,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
