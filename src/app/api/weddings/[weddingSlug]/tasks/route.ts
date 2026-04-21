import { type NextRequest, NextResponse } from "next/server";

import { resolvePersona } from "@/lib/employee/persona";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { taskTouchesWorkspaceUser } from "@/lib/wedding-task-scope";
import type { Database } from "@/types/database";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];
type TaskVisibility = Database["public"]["Enums"]["task_visibility"];

type CreateTaskPayload = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  linkedEventId?: string | null;
  dueDate?: string | null;
  assigneeUserIds?: string[];
  visibility?: TaskVisibility[];
  status?: TaskStatus;
};

type UpdateTaskPayload = {
  taskId?: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  linkedEventId?: string | null;
  dueDate?: string | null;
  assigneeUserIds?: string[];
  status?: TaskStatus;
  visibility?: TaskVisibility[];
};

const VALID_STATUSES = new Set<TaskStatus>(["todo", "in_progress", "needs_review", "done"]);
const VALID_PRIORITIES = new Set<TaskPriority>(["high", "medium", "low"]);
const VALID_VISIBILITY = new Set<TaskVisibility>(["team_only", "client_family", "vendor"]);

async function getWeddingIdBySlug(request: NextRequest, weddingSlug: string) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();

  if (weddingError || !wedding) return { errorResponse: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };

  return { supabase, weddingId: wedding.id, userId: user.id };
}

async function validateMembersBelogToWedding(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  weddingId: string,
  userIds: string[],
) {
  if (userIds.length === 0) return true;
  const { data: members } = await supabase
    .from("wedding_members")
    .select("user_id")
    .eq("wedding_id", weddingId)
    .in("user_id", userIds)
    .eq("status", "active");
  const validIds = new Set((members ?? []).map((m) => m.user_id));
  return userIds.every((id) => validIds.has(id));
}

async function validateEventBelongsToWedding(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  weddingId: string,
  eventId: string | null | undefined,
) {
  if (!eventId) return true;
  const { data: event } = await supabase
    .from("wedding_events")
    .select("id")
    .eq("id", eventId)
    .eq("wedding_id", weddingId)
    .maybeSingle();
  return Boolean(event);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as CreateTaskPayload;
    const title = payload.title?.trim();
    const status = payload.status ?? "todo";
    const priority = payload.priority ?? "medium";
    const visibility = (payload.visibility ?? ["team_only"]).filter((item) => VALID_VISIBILITY.has(item));

    if (!title || !VALID_STATUSES.has(status) || !VALID_PRIORITIES.has(priority) || visibility.length === 0) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId, userId } = lookup;

    const assigneeUserIds = (payload.assigneeUserIds ?? []).filter(Boolean);
    const [membersValid, eventValid] = await Promise.all([
      validateMembersBelogToWedding(supabase, weddingId, assigneeUserIds),
      validateEventBelongsToWedding(supabase, weddingId, payload.linkedEventId),
    ]);
    if (!membersValid) {
      return NextResponse.json({ error: "All assignees must be active wedding members." }, { status: 400 });
    }
    if (!eventValid) {
      return NextResponse.json({ error: "Linked event must belong to the same wedding." }, { status: 400 });
    }

    const primaryAssignee = assigneeUserIds[0] ?? null;
    const { error } = await (supabase.from("tasks") as any).insert({
      wedding_id: weddingId,
      title,
      description: payload.description?.trim() || null,
      priority,
      linked_event_id: payload.linkedEventId || null,
      due_date: payload.dueDate || null,
      assignee_user_id: primaryAssignee,
      assignee_user_ids: assigneeUserIds,
      raised_by_user_id: userId,
      visibility,
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Unable to create task." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create task." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as UpdateTaskPayload;

    if (!payload.taskId) {
      return NextResponse.json({ error: "Task id is required." }, { status: 400 });
    }

    if (payload.status && !VALID_STATUSES.has(payload.status)) {
      return NextResponse.json({ error: "Invalid task status." }, { status: 400 });
    }
    if (payload.priority && !VALID_PRIORITIES.has(payload.priority)) {
      return NextResponse.json({ error: "Invalid task priority." }, { status: 400 });
    }
    if (payload.visibility && payload.visibility.some((item) => !VALID_VISIBILITY.has(item))) {
      return NextResponse.json({ error: "Invalid task visibility." }, { status: 400 });
    }

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId, userId } = lookup;

    const updates: Database["public"]["Tables"]["tasks"]["Update"] & { assignee_user_ids?: string[] } = {};
    if (typeof payload.title === "string") updates.title = payload.title.trim();
    if (payload.description !== undefined) updates.description = payload.description?.trim() || null;
    if (payload.priority) updates.priority = payload.priority;
    if (payload.linkedEventId !== undefined) updates.linked_event_id = payload.linkedEventId || null;
    if (payload.dueDate !== undefined) updates.due_date = payload.dueDate || null;
    if (payload.assigneeUserIds !== undefined) {
      const ids = (payload.assigneeUserIds ?? []).filter(Boolean);
      updates.assignee_user_ids = ids;
      updates.assignee_user_id = ids[0] ?? null;
    }
    if (payload.visibility !== undefined) updates.visibility = payload.visibility;
    if (payload.status) {
      updates.status = payload.status;
      updates.completed_at = payload.status === "done" ? new Date().toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, assignee_user_id, assignee_user_ids, raised_by_user_id")
      .eq("id", payload.taskId)
      .eq("wedding_id", weddingId)
      .maybeSingle();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const persona = await resolvePersona(supabase, userId);
    if (
      persona === "employee" &&
      !taskTouchesWorkspaceUser(
        { ...task, assignee_user_ids: (task as any).assignee_user_ids ?? [] },
        userId,
      )
    ) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (payload.assigneeUserIds !== undefined) {
      const ids = (payload.assigneeUserIds ?? []).filter(Boolean);
      const membersValid = await validateMembersBelogToWedding(supabase, weddingId, ids);
      if (!membersValid) {
        return NextResponse.json({ error: "All assignees must be active wedding members." }, { status: 400 });
      }
    }

    if (payload.linkedEventId !== undefined) {
      const eventValid = await validateEventBelongsToWedding(supabase, weddingId, payload.linkedEventId);
      if (!eventValid) {
        return NextResponse.json({ error: "Linked event must belong to the same wedding." }, { status: 400 });
      }
    }

    const { error } = await supabase.from("tasks").update(updates as Database["public"]["Tables"]["tasks"]["Update"]).eq("id", payload.taskId);
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to update task." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update task." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as { taskId?: string };
    if (!payload.taskId) {
      return NextResponse.json({ error: "Task id is required." }, { status: 400 });
    }

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId, userId } = lookup;

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, assignee_user_id, assignee_user_ids, raised_by_user_id")
      .eq("id", payload.taskId)
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const persona = await resolvePersona(supabase, userId);
    if (
      persona === "employee" &&
      !taskTouchesWorkspaceUser(
        { ...task, assignee_user_ids: (task as any).assignee_user_ids ?? [] },
        userId,
      )
    ) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { error } = await supabase.from("tasks").delete().eq("id", payload.taskId);
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to delete task." }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete task." }, { status: 500 });
  }
}
