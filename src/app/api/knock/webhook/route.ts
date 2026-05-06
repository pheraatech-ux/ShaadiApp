import { type NextRequest, NextResponse } from "next/server";

import { getKnockClient } from "@/lib/knock";
import { getKnockWebhookSecret } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// ── Supabase webhook payload shape ───────────────────────────────────────────
type WebhookEvent = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function verifySecret(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${getKnockWebhookSecret()}`;
}

function parseMentions(body: string): string[] {
  // Matches @[display](userId) — standard rich-text mention format
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(body)) !== null) {
    ids.push(match[2]);
  }
  return [...new Set(ids)];
}

async function getProfile(userId: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return "A team member";
  return [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || "A team member";
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleTaskComment(event: WebhookEvent) {
  const knock = getKnockClient();
  const supabase = getSupabaseAdminClient();
  const record = event.record as {
    id: string;
    task_id: string;
    wedding_id: string;
    author_user_id: string | null;
    body: string;
    is_system: boolean;
  };

  if (!record.author_user_id) return;

  const { data: task } = await supabase
    .from("tasks")
    .select("id, assignee_user_id, raised_by_user_id, title")
    .eq("id", record.task_id)
    .maybeSingle();

  if (!task) return;

  const authorName = await getProfile(record.author_user_id);

  // 1. Reminder (is_system=true)
  if (record.is_system && task.assignee_user_id) {
    await knock.workflows.trigger("reminder", {
      recipients: [task.assignee_user_id],
      actor: record.author_user_id,
      tenant: record.wedding_id,
      data: {
        reminderBody: record.body,
        taskId: task.id,
        taskTitle: task.title ?? "a task",
        authorName,
      },
    });
    return;
  }

  // 2. Mentions — parse @mentions from comment body
  const mentionedIds = parseMentions(record.body).filter(
    (id) => id !== record.author_user_id,
  );
  if (mentionedIds.length > 0) {
    await knock.workflows.trigger("mention", {
      recipients: mentionedIds,
      actor: record.author_user_id,
      tenant: record.wedding_id,
      data: {
        commentBody: record.body,
        taskId: task.id,
        taskTitle: task.title ?? "a task",
        authorName,
      },
    });
  }

  // 3. Comment — notify assignee + task creator (excluding author + already mentioned)
  const alreadyNotified = new Set([record.author_user_id, ...mentionedIds]);
  const commentRecipients = [task.assignee_user_id, task.raised_by_user_id]
    .filter((id): id is string => !!id && !alreadyNotified.has(id));

  if (commentRecipients.length > 0) {
    await knock.workflows.trigger("comment-added", {
      recipients: commentRecipients,
      actor: record.author_user_id,
      tenant: record.wedding_id,
      data: {
        commentBody: record.body,
        taskId: task.id,
        taskTitle: task.title ?? "a task",
        authorName,
      },
    });
  }
}

async function handleTaskUpdate(event: WebhookEvent) {
  const knock = getKnockClient();
  const record = event.record as {
    id: string;
    wedding_id: string;
    assignee_user_id: string | null;
    title: string | null;
  };
  const oldRecord = event.old_record as {
    assignee_user_id: string | null;
  } | null;

  // Only trigger when assignee_user_id is newly set or changed
  const assigneeChanged =
    record.assignee_user_id &&
    record.assignee_user_id !== oldRecord?.assignee_user_id;

  if (!assigneeChanged || !record.assignee_user_id) return;

  await knock.workflows.trigger("task-assigned", {
    recipients: [record.assignee_user_id],
    tenant: record.wedding_id,
    data: {
      taskId: record.id,
      taskTitle: record.title ?? "A task",
      weddingId: record.wedding_id,
    },
  });
}

async function handleNewMessage(event: WebhookEvent) {
  const knock = getKnockClient();
  const supabase = getSupabaseAdminClient();
  const record = event.record as {
    id: string;
    thread_id: string;
    wedding_id: string;
    author_user_id: string | null;
    body: string;
  };

  if (!record.author_user_id) return;

  // Get all thread members except the sender
  const { data: members } = await supabase
    .from("message_thread_members")
    .select("user_id")
    .eq("thread_id", record.thread_id)
    .neq("user_id", record.author_user_id);

  const recipients = (members ?? []).map((m) => m.user_id);
  if (recipients.length === 0) return;

  // Get thread title
  const { data: thread } = await supabase
    .from("message_threads")
    .select("title")
    .eq("id", record.thread_id)
    .maybeSingle();

  const senderName = await getProfile(record.author_user_id);

  await knock.workflows.trigger("new-message", {
    recipients,
    actor: record.author_user_id,
    tenant: record.wedding_id,
    data: {
      messageBody: record.body,
      threadTitle: thread?.title ?? "a conversation",
      threadId: record.thread_id,
      senderName,
    },
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: WebhookEvent;
  try {
    event = (await request.json()) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (event.table === "task_comments" && event.type === "INSERT") {
      await handleTaskComment(event);
    } else if (event.table === "tasks" && event.type === "UPDATE") {
      await handleTaskUpdate(event);
    } else if (event.table === "messages" && event.type === "INSERT") {
      await handleNewMessage(event);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[knock/webhook] error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
