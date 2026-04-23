"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Lock,
  Send,
  Trash2,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  WeddingTaskPriority,
  WeddingTasksBoardMemberOption,
  WeddingTasksBoardStatus,
  WeddingTasksBoardTask,
} from "@/components/wedding-workspace/tasks/types";

// ── constants ──────────────────────────────────────────────

const STATUS_LABELS: Record<WeddingTasksBoardStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  needs_review: "Needs Review",
  done: "Done",
};

const STATUS_PILL: Record<WeddingTasksBoardStatus, string> = {
  todo: "bg-muted/60 text-muted-foreground border border-border/50",
  in_progress: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  needs_review: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  done: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const STATUS_TAB_ACTIVE: Record<WeddingTasksBoardStatus, string> = {
  todo: "bg-muted/80 text-foreground",
  in_progress: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  needs_review: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const PRIORITY_PILL: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  critical: "bg-red-500/20 text-red-400 border border-red-500/40",
};

const STATUSES: WeddingTasksBoardStatus[] = ["todo", "in_progress", "needs_review", "done"];
const PRIORITIES: WeddingTaskPriority[] = ["low", "medium", "high"];
const PRIORITY_LABELS: Record<WeddingTaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };
const PRIORITY_TEXT: Record<string, string> = {
  high: "text-rose-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

type ReminderChannel = "internal" | "whatsapp" | "both";

// ── helpers ────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function relativeAge(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.floor(ms / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function dueMeta(dueDate: string) {
  if (!dueDate) return { display: "—", sub: "No due date", tone: "text-muted-foreground" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  const display = due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  if (diff < 0) return { display, sub: `${Math.abs(diff)} days overdue`, tone: "text-rose-400" };
  if (diff === 0) return { display, sub: "Due today", tone: "text-amber-400" };
  return { display, sub: `${diff} days left`, tone: "text-emerald-400" };
}

// ── Avatar ─────────────────────────────────────────────────

function Avatar({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary ring-1 ring-border/40
        ${size === "sm" ? "size-6 text-[9px]" : "size-8 text-[11px]"}`}
    >
      {initials(label)}
    </span>
  );
}

// ── Types ──────────────────────────────────────────────────

type TaskDetailPanelProps = {
  weddingSlug: string;
  task: WeddingTasksBoardTask;
  members: WeddingTasksBoardMemberOption[];
  onBack: () => void;
  onTaskUpdated: (taskId: string, updates: Partial<WeddingTasksBoardTask>) => void;
  onTaskDeleted: (taskId: string) => void;
};

// ── Component ──────────────────────────────────────────────

export function TaskDetailPanel({
  weddingSlug,
  task,
  members,
  onBack,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailPanelProps) {
  // edit-mode state
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<WeddingTasksBoardStatus>(task.status);
  const [priority, setPriority] = useState<WeddingTaskPriority>(task.priority as WeddingTaskPriority);
  const [assigneeUserIds, setAssigneeUserIds] = useState<string[]>(task.assigneeIds);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [description, setDescription] = useState(task.description ?? "");

  // comments
  const [comments, setComments] = useState<WeddingTaskComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // reminder drawer
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderBody, setReminderBody] = useState("");
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>("both");

  // action loading
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);

  const primaryAssigneeLabel = useMemo(() => {
    if (task.assigneeIds.length === 0) return "Unassigned";
    const first = members.find((m) => m.id === task.assigneeIds[0]);
    return first?.label ?? task.assigneeLabel;
  }, [members, task]);

  // sync fields from prop when not editing
  useEffect(() => {
    if (isEditing) return;
    setStatus(task.status);
    setPriority(task.priority as WeddingTaskPriority);
    setAssigneeUserIds(task.assigneeIds);
    setDueDate(task.dueDate ?? "");
    setDescription(task.description ?? "");
  }, [task, isEditing]);

  // pre-fill reminder message
  useEffect(() => {
    if (reminderOpen) {
      setReminderBody(
        `Hi ${primaryAssigneeLabel}, please update "${task.title}" today. Let me know if there is any blocker.`,
      );
    }
  }, [reminderOpen, primaryAssigneeLabel, task.title]);

  // TODO: re-enable comment fetching — temporarily disabled to reduce server load
  // useEffect(() => {
  //   let cancelled = false;
  //   setLoadingComments(true);
  //   fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, { credentials: "include" })
  //     .then(async (r) => {
  //       if (!r.ok) throw new Error();
  //       return r.json() as Promise<{ comments: WeddingTaskComment[] }>;
  //     })
  //     .then((d) => { if (!cancelled) setComments(d.comments); })
  //     .catch(() => { if (!cancelled) setComments([]); })
  //     .finally(() => { if (!cancelled) setLoadingComments(false); });
  //   return () => { cancelled = true; };
  // }, [task.id, weddingSlug]);

  // derived
  const due = dueMeta(dueDate);
  const latestAt = comments.length > 0 ? comments[comments.length - 1].createdAt : task.createdAt;
  const visibilityLabel = task.visibility.length > 0
    ? task.visibility.map((v) => v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())).join(", ")
    : "All members";
  const priorityPill = PRIORITY_PILL[task.priority.toLowerCase()] ?? "bg-muted/60 text-muted-foreground border border-border/50";

  // handlers
  function discardEdits() {
    setStatus(task.status);
    setPriority(task.priority as WeddingTaskPriority);
    setAssigneeUserIds(task.assigneeIds);
    setDueDate(task.dueDate ?? "");
    setDescription(task.description ?? "");
    setIsEditing(false);
  }

  function toggleAssignee(uid: string) {
    setAssigneeUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status,
          priority,
          assigneeUserIds,
          dueDate: dueDate || null,
          description: description.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const assigneeMembers = assigneeUserIds
        .map((uid) => members.find((m) => m.id === uid))
        .filter(Boolean) as WeddingTasksBoardMemberOption[];
      const labels = assigneeMembers.map((m) => (m.isCurrentUser ? `${m.label} (you)` : m.label));
      onTaskUpdated(task.id, {
        status,
        priority,
        assigneeIds: assigneeUserIds,
        assigneeId: assigneeUserIds[0] ?? null,
        assigneeLabel: labels.length > 0 ? (labels.length === 1 ? labels[0] : `${labels[0]} +${labels.length - 1}`) : "Unassigned",
        assigneeLabels: labels.length > 0 ? labels : ["Unassigned"],
        dueDate: dueDate || null,
        description: description.trim() || null,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function patchStatus(next: WeddingTasksBoardStatus) {
    const prev = status;
    setStatus(next);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, status: next }),
      });
      if (!res.ok) throw new Error();
      onTaskUpdated(task.id, { status: next });
    } catch {
      setStatus(prev);
    }
  }

  async function sendForReview() {
    setSendingReview(true);
    try {
      await patchStatus("needs_review");
    } finally {
      setSendingReview(false);
    }
  }

  const sendForReviewDisabled = sendingReview || status === "needs_review";

  async function deleteTask() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      if (!res.ok) throw new Error();
      onTaskDeleted(task.id);
      onBack();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function postComment(kind: "comment" | "reminder") {
    const body = kind === "comment" ? commentBody.trim() : reminderBody.trim();
    if (!body) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, kind, channel: reminderChannel }),
      });
      if (!res.ok) return;
      const refreshed = await fetch(`/api/weddings/${weddingSlug}/tasks/${task.id}/comments`, {
        credentials: "include",
      });
      if (refreshed.ok) {
        const payload = (await refreshed.json()) as { comments: WeddingTaskComment[] };
        setComments(payload.comments);
        onTaskUpdated(task.id, { commentCount: payload.comments.length });
      }
      if (kind === "comment") setCommentBody("");
      else { setReminderBody(""); setReminderOpen(false); }
    } finally {
      setPostingComment(false);
    }
  }

  // ── render ─────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* ── Breadcrumb / top bar ── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to board
        </button>
        <span className="text-border">·</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Task Details
        </span>
        <span className="text-border">·</span>
        <span className="max-w-xs truncate text-xs text-muted-foreground">{task.title}</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Edit / lock-unlock toggle */}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={discardEdits}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Discard
              </button>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
                onClick={() => void saveChanges()}
                disabled={saving}
                type="button"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15"
              >
                <Unlock className="size-3.5" />
                Editing
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Lock className="size-3.5" />
              Edit
            </button>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sure?</span>
              <button
                type="button"
                onClick={() => void deleteTask()}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border/70 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── LEFT ── */}
        <div className="min-w-0 flex-1 overflow-y-auto border-r border-border/60 px-6 py-6">
          {/* Tags row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_PILL[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_PILL[priority] ?? priorityPill}`}>
              {PRIORITY_LABELS[priority] ?? priority}
            </span>
            {task.linkedEventLabel && (
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {task.linkedEventLabel}
              </span>
            )}
            {task.visibility.length > 0 && (
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {visibilityLabel}
              </span>
            )}
          </div>

          {/* Title & subtitle */}
          <h1 className="mb-1 text-[22px] font-bold leading-snug tracking-tight text-foreground">
            {task.title}
          </h1>
          <p className="mb-3 text-sm text-muted-foreground">
            Created by{" "}
            <span className="font-medium text-foreground">{task.raisedByLabel}</span>
            {" · "}
            {fmtDate(task.createdAt)}
          </p>

          {/* Description — inline under title */}
          <div className="mb-6">
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                className="min-h-24 resize-none rounded-xl border-border/70 bg-muted/20 text-sm leading-relaxed"
              />
            ) : description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {/* 4 stat blocks */}
          <div className="-mx-6 grid grid-cols-2 border-y border-border/60 sm:grid-cols-4">
            {/* Due Date */}
            <div className="flex flex-col items-center justify-center border-r border-border/60 px-4 py-4 text-center">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Due Date
              </span>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 text-xs text-foreground hover:bg-muted/60">
                    <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                    {dueDate
                      ? new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                      : <span className="text-muted-foreground">Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                    <Calendar
                      mode="single"
                      selected={dueDate ? new Date(`${dueDate}T00:00:00`) : undefined}
                      onSelect={(day) =>
                        setDueDate(
                          day
                            ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`
                            : "",
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <>
                  <span className={`text-[15px] font-bold ${due.tone}`}>{due.display}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{due.sub}</span>
                </>
              )}
            </div>
            {/* Last Updated */}
            <div className="flex flex-col items-center justify-center px-4 py-4 text-center sm:border-r sm:border-border/60">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Last Updated
              </span>
              <span className="text-[15px] font-bold text-violet-400">{relativeAge(latestAt)}</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                {comments.length > 0 ? "Comment added" : "Task created"}
              </span>
            </div>
            {/* Priority */}
            <div className="flex flex-col items-center justify-center border-r border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Priority
              </span>
              {isEditing ? (
                <Select value={priority} onValueChange={(v) => setPriority(v as WeddingTaskPriority)}>
                  <SelectTrigger className="h-8 rounded-lg border-border/70 bg-muted/40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <span className={`text-[15px] font-bold ${PRIORITY_TEXT[priority] ?? "text-foreground"}`}>{PRIORITY_LABELS[priority] ?? priority}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">Task level</span>
                </>
              )}
            </div>
            {/* Status */}
            <div className="flex flex-col items-center justify-center border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Status
              </span>
              <span className="text-[15px] font-bold text-foreground">{STATUS_LABELS[status]}</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">Current</span>
            </div>
          </div>

          {/* Status tab bar */}
          <div className="mb-6 mt-3 flex overflow-hidden rounded-xl border border-border/60">
            {STATUSES.map((s, i) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (active) return;
                    if (isEditing) setStatus(s);
                    else void patchStatus(s);
                  }}
                  className={[
                    "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all",
                    i > 0 ? "border-l border-border/60" : "",
                    active ? STATUS_TAB_ACTIVE[s] : "cursor-pointer text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {active && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          {/* Comments */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Comments & Updates
                {comments.length > 0 && (
                  <span className="ml-2 rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    {comments.length}
                  </span>
                )}
              </p>
              <span className="text-[11px] text-muted-foreground/50">Visible to your team</span>
            </div>

            <div className="mb-3 space-y-2">
              {loadingComments ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Loading…</p>
              ) : comments.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground/40">No updates yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3 rounded-xl border border-border/60 bg-background/50 p-3">
                    <Avatar label={c.authorLabel} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{c.authorLabel}</span>
                        {c.isSystem && (
                          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-400">
                            system
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                          {relativeAge(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{c.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add an update or comment…"
                className="min-h-10 resize-none rounded-xl border-border/70 bg-muted/20 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void postComment("comment");
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 self-end rounded-xl"
                onClick={() => void postComment("comment")}
                disabled={postingComment || !commentBody.trim()}
              >
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── RIGHT sidebar ── */}
        <div className="w-72 shrink-0 divide-y divide-border/60 overflow-y-auto">
          {/* Task info */}
          <div className="px-5 py-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Task Info
            </p>
            <dl className="space-y-2.5">
              {[
                { label: "Created by", value: task.raisedByLabel },
                { label: "Created on", value: fmtDate(task.createdAt) },
                { label: "Event category", value: task.linkedEventLabel || "—" },
                { label: "Visibility", value: visibilityLabel },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2 text-xs">
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Assigned to */}
          <div className="px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Assigned To
              </p>
              <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {(isEditing ? assigneeUserIds : task.assigneeIds).length}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-1.5">
                {members.map((m) => {
                  const sel = assigneeUserIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleAssignee(m.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${
                        sel
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <Avatar label={m.label} size="sm" />
                      <span className="flex-1 text-left font-medium">
                        {m.label}
                        {m.isCurrentUser && (
                          <span className="ml-1 font-normal opacity-60">(you)</span>
                        )}
                      </span>
                      {sel && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </button>
                  );
                })}
                {members.length === 0 && (
                  <p className="text-xs text-muted-foreground/50">No members on this wedding.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {task.assigneeIds.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40">Unassigned</p>
                ) : (
                  task.assigneeIds.map((uid, i) => {
                    const label = task.assigneeLabels[i] ?? uid;
                    const member = members.find((m) => m.id === uid);
                    return (
                      <div key={uid} className="flex items-center gap-2.5">
                        <Avatar label={label} size="sm" />
                        <span className="flex-1 truncate text-xs font-medium text-foreground">
                          {label}
                          {member?.isCurrentUser && (
                            <span className="ml-1 font-normal text-muted-foreground">(you)</span>
                          )}
                        </span>
                        {member?.role && (
                          <span className="shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                            {member.role.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 py-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Actions
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full rounded-xl"
                onClick={() => void sendForReview()}
                disabled={sendForReviewDisabled}
              >
                <Send className="size-3.5" />
                {sendingReview ? "Sending…" : "Send for Review"}
              </Button>

              <button
                type="button"
                onClick={() => setReminderOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="size-3.5" />
                  Send Reminder
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${reminderOpen ? "rotate-180" : ""}`}
                />
              </button>

              {reminderOpen && (
                <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex gap-1">
                    {(["internal", "whatsapp", "both"] as ReminderChannel[]).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setReminderChannel(ch)}
                        className={`flex-1 rounded-lg border py-1 text-[10px] font-semibold capitalize transition-colors ${
                          reminderChannel === ch
                            ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                            : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={reminderBody}
                    onChange={(e) => setReminderBody(e.target.value)}
                    className="min-h-[72px] resize-none rounded-xl border-border/70 bg-background text-xs"
                    placeholder="Reminder message…"
                  />
                  <Button
                    type="button"
                    className="h-8 w-full rounded-xl bg-amber-600 text-white hover:bg-amber-500"
                    onClick={() => void postComment("reminder")}
                    disabled={postingComment || !reminderBody.trim()}
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
