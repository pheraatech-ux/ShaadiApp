import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ taskId: string }> };

const ALLOWED_STATUSES = ["todo", "in_progress", "needs_review", "done"] as const;
type TaskStatus = (typeof ALLOWED_STATUSES)[number];

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { taskId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const newStatus = body.status as TaskStatus | undefined;
  if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Verify vendor has this task assigned
  const { data: task } = await admin
    .from("tasks")
    .select("id, wedding_id, assignee_user_ids")
    .eq("id", taskId)
    .maybeSingle();

  if (!task || !task.assignee_user_ids.includes(user.id)) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  // Verify vendor is active for this wedding
  const { data: vendor } = await admin
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .eq("wedding_id", task.wedding_id)
    .eq("invite_status", "active")
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { error } = await admin
    .from("tasks")
    .update({
      status: newStatus,
      completed_at: newStatus === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, status: newStatus });
}
