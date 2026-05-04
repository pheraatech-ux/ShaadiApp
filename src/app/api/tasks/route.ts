import { type NextRequest, NextResponse } from "next/server";

import { resolvePersonaFromUser } from "@/lib/employee/persona";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { AllTasksBoardTask } from "@/components/wedding-workspace/tasks/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const persona = resolvePersonaFromUser(user);
    const userId = user.id;

    // Resolve accessible wedding IDs for this user
    const { data: memberData } = await supabase
      .from("wedding_members")
      .select("wedding_id")
      .eq("user_id", userId)
      .neq("status", "removed");

    const weddingIds = [...new Set((memberData ?? []).map((r) => r.wedding_id))];
    if (!weddingIds.length) return NextResponse.json({ tasks: [] });

    const { data: weddingRows } = await supabase
      .from("weddings")
      .select("id, slug, couple_name")
      .in("id", weddingIds);

    const weddingById = new Map(
      (weddingRows ?? []).map((w) => [w.id, { slug: w.slug, name: w.couple_name }]),
    );

    const tasksBaseQuery = supabase
      .from("tasks")
      .select("id, wedding_id, title, description, status, priority, due_date, linked_event_id, assignee_user_id, assignee_user_ids, raised_by_user_id, visibility, created_at")
      .in("wedding_id", weddingIds)
      .order("created_at", { ascending: false });

    const [{ data: taskRows }, { data: memberRows }, { data: eventRows }, { data: commentRows }] = await Promise.all([
      persona === "employee"
        ? tasksBaseQuery.or(`assignee_user_ids.cs.{${userId}},assignee_user_id.eq.${userId},raised_by_user_id.eq.${userId}`)
        : tasksBaseQuery,
      supabase
        .from("wedding_members")
        .select("user_id, invited_email, display_name, role, wedding_id")
        .in("wedding_id", weddingIds)
        .eq("status", "active"),
      supabase
        .from("wedding_events")
        .select("id, title, wedding_id")
        .in("wedding_id", weddingIds),
      supabase
        .from("task_comments")
        .select("task_id")
        .in("wedding_id", weddingIds),
    ]);

    type RawTask = {
      id: string; wedding_id: string; title: string; description: string | null;
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

    const tasks: AllTasksBoardTask[] = rawTasks.map((t) => {
      const wedding = weddingById.get(t.wedding_id);
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
        linkedEventLabel: t.linked_event_id ? (eventById.get(t.linked_event_id) ?? "General") : "General",
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
        weddingId: t.wedding_id,
        weddingSlug: wedding?.slug ?? "",
        weddingName: wedding?.name ?? "Wedding",
      };
    });

    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ error: "Unable to fetch tasks." }, { status: 500 });
  }
}
