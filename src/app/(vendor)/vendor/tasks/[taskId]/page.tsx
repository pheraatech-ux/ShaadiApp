import { notFound, redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorTaskDetail } from "@/components/vendor/tasks/vendor-task-detail";

type PageProps = { params: Promise<{ taskId: string }> };

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function displayName(first?: string | null, last?: string | null, fallback = "Planner") {
  return [first?.trim(), last?.trim()].filter(Boolean).join(" ") || fallback;
}

export default async function VendorTaskDetailPage({ params }: PageProps) {
  const { taskId } = await params;
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();

  const [{ data: task }, { data: rawComments }] = await Promise.all([
    admin
      .from("tasks")
      .select("id, title, description, status, due_date, priority, assignee_user_ids, wedding_id")
      .eq("id", taskId)
      .eq("wedding_id", ctx.weddingId)
      .maybeSingle(),
    admin
      .from("task_comments")
      .select("id, body, created_at, author_user_id, is_system")
      .eq("task_id", taskId)
      .eq("is_system", false)
      .order("created_at", { ascending: true }),
  ]);

  if (!task || !task.assignee_user_ids.includes(ctx.userId)) {
    notFound();
  }

  // Resolve author names
  const authorIds = [...new Set((rawComments ?? []).map((c) => c.author_user_id).filter(Boolean) as string[])];
  const { data: profiles } = authorIds.length > 0
    ? await admin.from("profiles").select("id, first_name, last_name").in("id", authorIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const comments = (rawComments ?? []).map((c) => {
    const isMe = c.author_user_id === ctx.userId;
    const profile = c.author_user_id ? profileMap.get(c.author_user_id) : null;
    const name = isMe ? "You" : displayName(profile?.first_name, profile?.last_name);
    return {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      author_user_id: c.author_user_id,
      authorName: name,
      authorInitials: getInitials(name),
      isCurrentUser: isMe,
    };
  });

  return (
    <VendorTaskDetail
      taskId={task.id}
      title={task.title}
      description={task.description}
      status={task.status as "todo" | "in_progress" | "needs_review" | "done"}
      due_date={task.due_date}
      priority={task.priority}
      comments={comments}
    />
  );
}
