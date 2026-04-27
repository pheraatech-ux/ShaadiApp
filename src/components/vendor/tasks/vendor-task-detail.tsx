"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type TaskStatus = "todo" | "in_progress" | "needs_review" | "done";

type TaskComment = {
  id: string;
  body: string;
  created_at: string;
  author_user_id: string | null;
  authorName: string;
  authorInitials: string;
  isCurrentUser: boolean;
};

type VendorTaskDetailProps = {
  taskId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  comments: TaskComment[];
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  needs_review: "Needs review",
  done: "Done",
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  needs_review: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

type NextAction = { label: string; nextStatus: TaskStatus } | null;

function getNextAction(status: TaskStatus): NextAction {
  if (status === "todo") return { label: "Start working", nextStatus: "in_progress" };
  if (status === "in_progress") return { label: "Submit for review", nextStatus: "needs_review" };
  if (status === "needs_review") return { label: "Mark as done", nextStatus: "done" };
  return null;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function VendorTaskDetail({
  taskId,
  title,
  description,
  status: initialStatus,
  due_date,
  priority,
  comments: initialComments,
}: VendorTaskDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [comments, setComments] = useState<TaskComment[]>(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [updatingStatus, startStatusTransition] = useTransition();
  const [sendingComment, startCommentTransition] = useTransition();

  const nextAction = getNextAction(status);

  function handleStatusUpdate() {
    if (!nextAction) return;
    const newStatus = nextAction.nextStatus;
    startStatusTransition(async () => {
      const res = await fetch(`/api/vendor/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    });
  }

  function handleSendComment() {
    const body = commentBody.trim();
    if (!body) return;
    startCommentTransition(async () => {
      const res = await fetch(`/api/vendor/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const data = (await res.json()) as { comment: { id: string; body: string; created_at: string } };
        setComments((prev) => [
          ...prev,
          {
            id: data.comment.id,
            body: data.comment.body,
            created_at: data.comment.created_at,
            author_user_id: null,
            authorName: "You",
            authorInitials: "YO",
            isCurrentUser: true,
          },
        ]);
        setCommentBody("");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Back */}
      <Link href="/vendor/tasks" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 rounded-lg gap-1.5")}>
        <ArrowLeft className="size-4" />
        All tasks
      </Link>

      {/* Task header */}
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{priority} priority</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">{title}</h1>
            {due_date && (
              <p className="mt-1 text-sm text-muted-foreground">
                Due {new Date(due_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
          <Badge variant="outline" className={STATUS_CLASSES[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        {description && (
          <>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </>
        )}

        {nextAction && (
          <div className="mt-5">
            <Button
              className="rounded-xl"
              onClick={handleStatusUpdate}
              disabled={updatingStatus}
            >
              {updatingStatus ? <Loader2 className="size-4 animate-spin" /> : null}
              {nextAction.label}
            </Button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-border/70 bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Discussion</h2>

        {comments.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">No messages yet. Send one to your planner.</p>
        ) : (
          <div className="mb-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${comment.isCurrentUser ? "flex-row-reverse" : ""}`}>
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {comment.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${comment.isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`rounded-xl px-3 py-2 text-sm ${
                      comment.isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {comment.body}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(comment.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Send a message to your planner…"
            className="min-h-0 resize-none rounded-xl"
            rows={2}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
          />
          <Button
            size="icon"
            className="shrink-0 self-end rounded-xl"
            onClick={handleSendComment}
            disabled={!commentBody.trim() || sendingComment}
          >
            {sendingComment ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
