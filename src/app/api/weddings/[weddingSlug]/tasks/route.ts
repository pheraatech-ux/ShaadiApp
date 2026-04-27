import { type NextRequest, NextResponse } from "next/server";

import { resolvePersonaFromUser } from "@/lib/employee/persona";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { taskTouchesWorkspaceUser } from "@/lib/wedding-task-scope";
import type { WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";
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

  return { supabase, weddingId: wedding.id, userId: user.id, user };
}

async function validateMembersBelogToWedding(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  weddingId: string,
  userIds: string[],
) {
  if (userIds.length === 0) return true;
  const [{ data: members }, { data: vendors }] = await Promise.all([
    supabase
      .from("wedding_members")
      .select("user_id")
      .eq("wedding_id", weddingId)
      .in("user_id", userIds)
      .eq("status", "active"),
    (supabase as any)
      .from("vendors")
      .select("user_id")
      .eq("wedding_id", weddingId)
      .eq("invite_status", "active")
      .in("user_id", userIds),
  ]);
  const validIds = new Set([
    ...(members ?? []).map((m: { user_id: string | null }) => m.user_id).filter((id: string | null): id is string => id != null),
    ...(vendors ?? []).map((v: { user_id: string | null }) => v.user_id).filter((id: string | null): id is string => id != null),
  ]);
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId, userId, user } = lookup;

    const persona = resolvePersonaFromUser(user);

    const tasksBaseQuery = supabase
      .from("tasks")
      .select("id, title, description, status, priority, due_date, linked_event_id, assignee_user_id, assignee_user_ids, raised_by_user_id, visibility, created_at")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });

    const [{ data: taskRows }, { data: memberRows }, { data: eventRows }, { data: commentRows }] = await Promise.all([
      persona === "employee"
        ? tasksBaseQuery.or(`assignee_user_ids.cs.{${userId}},assignee_user_id.eq.${userId},raised_by_user_id.eq.${userId}`)
        : tasksBaseQuery,
      supabase
        .from("wedding_members")
        .select("user_id, invited_email, display_name, role")
        .eq("wedding_id", weddingId)
        .eq("status", "active"),
      supabase
        .from("wedding_events")
        .select("id, title")
        .eq("wedding_id", weddingId),
      supabase
        .from("task_comments")
        .select("task_id")
        .eq("wedding_id", weddingId),
    ]);

    type RawTask = {
      id: string; title: string; description: string | null;
      status: "todo" | "in_progress" | "needs_review" | "done";
      priority: "high" | "medium" | "low";
      due_date: string | null; linked_event_id: string | null;
      assignee_user_id: string | null; assignee_user_ids: string[];
      raised_by_user_id: string | null;
      visibility: ("team_only" | "client_family" | "vendor")[] | null;
      created_at: string;
    };

    const rawTasks = (taskRows ?? []) as RawTask[];

    const memberUserIds = [...new Set((memberRows ?? []).map((m) => m.user_id).filter(Boolean))] as string[];
    const allAssigneeIds = [...new Set(rawTasks.flatMap((t) => t.assignee_user_ids ?? []))];
    const profileIds = [...new Set([...memberUserIds, ...allAssigneeIds])];

    const { data: profileRows } = profileIds.length > 0
      ? await supabase.from("profiles").select("id, first_name, last_name").in("id", profileIds)
      : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };

    const profileNameById = new Map(
      (profileRows ?? []).map((p) => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
        return [p.id, name || "Team member"];
      }),
    );
    const memberDisplayById = new Map(
      (memberRows ?? [])
        .filter((m) => Boolean(m.user_id))
        .map((m) => [m.user_id as string, m.display_name || m.invited_email || "Team member"]),
    );
    function resolveLabel(uid: string) {
      return profileNameById.get(uid) || memberDisplayById.get(uid) || "Team member";
    }

    const eventById = new Map((eventRows ?? []).map((e) => [e.id, e.title]));
    const commentCountByTaskId = new Map<string, number>();
    for (const row of commentRows ?? []) {
      commentCountByTaskId.set(row.task_id, (commentCountByTaskId.get(row.task_id) ?? 0) + 1);
    }

    const today = new Date().toISOString().slice(0, 10);
    const oneWeekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const tasks: WeddingTasksBoardTask[] = rawTasks.map((t) => {
      const assigneeIds: string[] =
        (t.assignee_user_ids ?? []).length > 0
          ? t.assignee_user_ids
          : t.assignee_user_id ? [t.assignee_user_id] : [];
      const assigneeLabels = assigneeIds.map((id) => {
        const label = resolveLabel(id);
        return id === userId ? `${label} (you)` : label;
      });
      const raisedByLabel = t.raised_by_user_id
        ? t.raised_by_user_id === userId
          ? `${resolveLabel(t.raised_by_user_id)} (me)`
          : resolveLabel(t.raised_by_user_id)
        : "Team member";

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority ?? "medium",
        dueDate: t.due_date,
        linkedEventId: t.linked_event_id,
        linkedEventLabel: t.linked_event_id ? (eventById.get(t.linked_event_id) ?? "General (no event)") : "General (no event)",
        assigneeId: assigneeIds[0] ?? null,
        assigneeIds,
        assigneeLabel: assigneeLabels.length === 0
          ? "Unassigned"
          : assigneeLabels.length === 1
            ? assigneeLabels[0]
            : `${assigneeLabels[0]} +${assigneeLabels.length - 1}`,
        assigneeLabels: assigneeLabels.length > 0 ? assigneeLabels : ["Unassigned"],
        raisedByUserId: t.raised_by_user_id,
        raisedByLabel,
        visibility: t.visibility ?? ["team_only"],
        commentCount: commentCountByTaskId.get(t.id) ?? 0,
        isAssignedToCurrentUser: assigneeIds.includes(userId),
        isOverdue: Boolean(t.status !== "done" && t.due_date && t.due_date < today),
        isDueThisWeek: Boolean(t.status !== "done" && t.due_date && t.due_date >= today && t.due_date <= oneWeekFromNow),
        createdAt: t.created_at,
      };
    });

    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ error: "Unable to fetch tasks." }, { status: 500 });
  }
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
    const { supabase, weddingId, userId, user } = lookup;

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

    const persona = resolvePersonaFromUser(user);
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
    const { supabase, weddingId, userId, user } = lookup;

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, assignee_user_id, assignee_user_ids, raised_by_user_id")
      .eq("id", payload.taskId)
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const persona = resolvePersonaFromUser(user);
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
