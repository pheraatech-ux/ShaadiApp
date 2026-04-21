import { type NextRequest, NextResponse } from "next/server";

import { resolvePersona } from "@/lib/employee/persona";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { taskTouchesWorkspaceUser } from "@/lib/wedding-task-scope";

type CommentPayload = {
  body?: string;
  kind?: "comment" | "reminder";
  channel?: "internal" | "whatsapp" | "both";
};

async function resolveContext(
  request: NextRequest,
  weddingSlug: string,
  taskId: string,
) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const { data: wedding } = await supabase.from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  if (!wedding) return { errorResponse: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, assignee_user_id, raised_by_user_id")
    .eq("id", taskId)
    .eq("wedding_id", wedding.id)
    .maybeSingle();
  if (!task) return { errorResponse: NextResponse.json({ error: "Task not found." }, { status: 404 }) };

  const persona = await resolvePersona(supabase, user.id);
  if (persona === "employee" && !taskTouchesWorkspaceUser(task, user.id)) {
    return { errorResponse: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { supabase, userId: user.id, weddingId: wedding.id };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string; taskId: string }> },
) {
  try {
    const { weddingSlug, taskId } = await context.params;
    const lookup = await resolveContext(request, weddingSlug, taskId);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase } = lookup;

    const { data: comments, error } = await supabase
      .from("task_comments")
      .select("id, body, created_at, author_user_id, is_system")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to load comments." }, { status: 400 });
    }

    const authorIds = [...new Set((comments ?? []).map((c) => c.author_user_id).filter(Boolean))] as string[];
    const { data: profiles } =
      authorIds.length > 0
        ? await supabase.from("profiles").select("id, first_name, last_name").in("id", authorIds)
        : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };
    const nameById = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Team member",
      ]),
    );

    return NextResponse.json({
      comments: (comments ?? []).map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.created_at,
        authorUserId: comment.author_user_id,
        authorLabel: comment.author_user_id ? nameById.get(comment.author_user_id) ?? "Team member" : "System",
        isSystem: comment.is_system,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unable to load comments." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string; taskId: string }> },
) {
  try {
    const { weddingSlug, taskId } = await context.params;
    const payload = (await request.json()) as CommentPayload;
    const rawBody = payload.body?.trim();
    if (!rawBody) {
      return NextResponse.json({ error: "Comment body is required." }, { status: 400 });
    }

    const lookup = await resolveContext(request, weddingSlug, taskId);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, userId, weddingId } = lookup;

    const channelLabel =
      payload.channel === "whatsapp" ? "WhatsApp" : payload.channel === "both" ? "Internal + WhatsApp" : "Internal";
    const body = payload.kind === "reminder" ? `Reminder (${channelLabel}): ${rawBody}` : rawBody;
    const isSystem = payload.kind === "reminder";

    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId,
      wedding_id: weddingId,
      author_user_id: userId,
      body,
      is_system: isSystem,
    });
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to post comment." }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to post comment." }, { status: 500 });
  }
}
