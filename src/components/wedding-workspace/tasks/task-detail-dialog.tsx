"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  WeddingTaskComment,
  WeddingTasksBoardMemberOption,
  WeddingTasksBoardStatus,
  WeddingTasksBoardTask,
} from "@/components/wedding-workspace/tasks/types";

type TaskDetailDialogProps = {
  weddingSlug: string;
  task: WeddingTasksBoardTask | null;
  members: WeddingTasksBoardMemberOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: (taskId: string, updates: Partial<WeddingTasksBoardTask>) => void;
  onTaskDeleted: (taskId: string) => void;
};

type ReminderChannel = "internal" | "whatsapp" | "both";

function getRelativeAgeLabel(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function TaskDetailDialog({
  weddingSlug,
  task,
  members,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailDialogProps) {
  const [status, setStatus] = useState<WeddingTasksBoardStatus>("todo");
  const [assigneeUserId, setAssigneeUserId] = useState("unassigned");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState<WeddingTaskComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [reminderBody, setReminderBody] = useState("");
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>("both");
  const [loadingComments, setLoadingComments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const assigneeLabel = useMemo(() => {
    if (!task) return "Unassigned";
    if (!task.assigneeId) return "Unassigned";
    const member = members.find((item) => item.id === task.assigneeId);
    return member ? (member.isCurrentUser ? `${member.label} (you)` : member.label) : task.assigneeLabel;
  }, [members, task]);

  useEffect(() => {
    if (!task || !open) return;
    setStatus(task.status);
    setAssigneeUserId(task.assigneeId ?? "unassigned");
    setDescription(task.description ?? "");
    setCommentBody("");
    setReminderBody(
      `Hi ${assigneeLabel}, please update "${task.title}" today. Let me know if there is any blocker.`,
    );
  }, [assigneeLabel, open, task]);

  useEffect(() => {
    if (!task || !open) return;
    let cancelled = false;
    setLoadingComments(true);
    fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load comments.");
        return response.json() as Promise<{ comments: WeddingTaskComment[] }>;
      })
      .then((payload) => {
        if (!cancelled) setComments(payload.comments);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, task, weddingSlug]);

  if (!task) return null;

  const dueStats = (() => {
    if (!task.dueDate) {
      return { value: "--", label: "No due date", tone: "text-muted-foreground" };
    }
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const due = new Date(`${task.dueDate}T00:00:00`);
    const diffDays = Math.ceil((due.getTime() - startToday.getTime()) / 86400000);
    if (diffDays < 0) {
      return { value: `${Math.abs(diffDays)}d`, label: "Overdue", tone: "text-rose-300" };
    }
    if (diffDays === 0) {
      return { value: "Today", label: "Due now", tone: "text-amber-300" };
    }
    return { value: `${diffDays}d`, label: "Days left", tone: "text-emerald-300" };
  })();

  const latestActivityAt = comments.length > 0 ? comments[comments.length - 1].createdAt : task.createdAt;
  const latestActivityLabel = `${getRelativeAgeLabel(latestActivityAt)} ago`;

  async function saveChanges() {
    if (!task) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status,
          assigneeUserId: assigneeUserId === "unassigned" ? null : assigneeUserId,
          description: description.trim() || null,
        }),
      });
      if (!response.ok) throw new Error();

      const member = members.find((item) => item.id === assigneeUserId);
      const assigneeText = assigneeUserId === "unassigned" ? "Unassigned" : member ? (member.isCurrentUser ? `${member.label} (you)` : member.label) : task.assigneeLabel;
      onTaskUpdated(task.id, {
        status,
        assigneeId: assigneeUserId === "unassigned" ? null : assigneeUserId,
        assigneeLabel: assigneeText,
        description: description.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask() {
    if (!task) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      if (!response.ok) throw new Error();
      onTaskDeleted(task.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  async function postComment(kind: "comment" | "reminder") {
    if (!task) return;
    const body = kind === "comment" ? commentBody.trim() : reminderBody.trim();
    if (!body) return;
    const response = await fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body,
        kind,
        channel: reminderChannel,
      }),
    });
    if (!response.ok) return;

    const refreshed = await fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, {
      credentials: "include",
    });
    if (refreshed.ok) {
      const payload = (await refreshed.json()) as { comments: WeddingTaskComment[] };
      setComments(payload.comments);
      onTaskUpdated(task.id, { commentCount: payload.comments.length });
    }
    if (kind === "comment") setCommentBody("");
    else setReminderBody("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b border-border/60 px-6 pt-5 pb-4">
          <DialogTitle>Task detail - {task.title}</DialogTitle>
          <DialogDescription>
            Created by {task.raisedByLabel} - Assigned to {task.assigneeLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
          <section className="grid gap-2 sm:grid-cols-4">
            <article className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
              <p className={`text-2xl font-semibold ${dueStats.tone}`}>{dueStats.value}</p>
              <p className="text-xs text-muted-foreground">{dueStats.label}</p>
            </article>
            <article className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
              <p className="text-2xl font-semibold text-violet-300">{latestActivityLabel}</p>
              <p className="text-xs text-muted-foreground">Last update</p>
            </article>
            <article className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{task.priority}</p>
              <p className="text-xs text-muted-foreground">Priority</p>
            </article>
            <article className="rounded-lg border border-border/70 bg-background/70 p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{comments.length || task.commentCount}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </article>
          </section>

          <section className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Description</label>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20" />
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Status</label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (!value) return;
                  setStatus(value as WeddingTasksBoardStatus);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-muted/40 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="needs_review">Needs review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Assigned to</label>
              <Select
                value={assigneeUserId}
                onValueChange={(value) => {
                  if (!value) return;
                  setAssigneeUserId(value);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-muted/40 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.isCurrentUser ? `${member.label} (you)` : member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Comments & updates</p>
            <div className="space-y-2 rounded-xl border border-border/70 bg-background/30 p-3">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                comments.map((comment) => (
                  <article key={comment.id} className="rounded-lg border border-border/60 bg-background/70 p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{comment.authorLabel}</span>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      {comment.isSystem ? <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">system</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-foreground">{comment.body}</p>
                  </article>
                ))
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                className="min-h-11"
                placeholder="Add update or comment..."
              />
              <Button className="h-11 rounded-xl" onClick={() => void postComment("comment")} type="button">
                Post
              </Button>
            </div>
          </section>

          <section className="space-y-2 rounded-xl border border-violet-500/40 bg-violet-500/8 p-3">
            <p className="text-sm font-medium text-violet-200">Send reminder</p>
            <div className="flex gap-2">
              {(["internal", "whatsapp", "both"] as ReminderChannel[]).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setReminderChannel(channel)}
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    reminderChannel === channel
                      ? "border-violet-500/70 bg-violet-500/20 text-violet-200"
                      : "border-border/60 bg-background/40 text-muted-foreground"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
            <Textarea
              value={reminderBody}
              onChange={(event) => setReminderBody(event.target.value)}
              className="min-h-16 border-violet-500/50 bg-background/60"
              placeholder="Reminder message..."
            />
            <Button type="button" className="h-10 w-full rounded-xl bg-emerald-700 text-white hover:bg-emerald-600" onClick={() => void postComment("reminder")}>
              Send reminder
            </Button>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:gap-3">
          <Button className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => void saveChanges()} disabled={saving || deleting} type="button">
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => void deleteTask()} disabled={saving || deleting} type="button">
            {deleting ? "Deleting..." : "Delete task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
