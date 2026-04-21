"use client";

import { FormEvent, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { WeddingTasksBoardMemberOption, WeddingTasksBoardStatus } from "@/components/wedding-workspace/tasks/types";

type NewTaskDialogProps = {
  weddingSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserLabel: string;
  members: WeddingTasksBoardMemberOption[];
  events: { id: string; label: string; dateLabel: string }[];
  onTaskCreated: () => void;
};

type TaskPriority = "high" | "medium" | "low";
type TaskVisibility = "team_only" | "client_family" | "vendor";

const PRIORITY_OPTIONS: { id: TaskPriority; label: string; helper: string }[] = [
  { id: "high", label: "High", helper: "Escalated to dashboard" },
  { id: "medium", label: "Medium", helper: "Standard priority" },
  { id: "low", label: "Low", helper: "Do when able" },
];

const VISIBILITY_OPTIONS: { id: TaskVisibility; label: string }[] = [
  { id: "team_only", label: "Team only" },
  { id: "client_family", label: "Visible to client family" },
  { id: "vendor", label: "Visible to vendor" },
];

function roleLabel(role: WeddingTasksBoardMemberOption["role"]) {
  if (role === "owner") return "Owner";
  if (role === "lead") return "Lead coordinator";
  if (role === "coordinator") return "Coordinator";
  return "Viewer";
}

function priorityCardClass(priorityId: TaskPriority, selected: boolean) {
  if (!selected) {
    return "border-border/80 bg-muted/20 hover:bg-muted/40";
  }
  if (priorityId === "high") {
    return "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/40";
  }
  if (priorityId === "medium") {
    return "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40";
  }
  return "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40";
}

function priorityTitleClass(priorityId: TaskPriority, selected: boolean) {
  if (!selected) return "";
  if (priorityId === "high") return "text-rose-700 dark:text-rose-300";
  if (priorityId === "medium") return "text-amber-700 dark:text-amber-300";
  return "text-emerald-700 dark:text-emerald-300";
}

export function NewTaskDialog({
  weddingSlug,
  open,
  onOpenChange,
  currentUserLabel,
  members,
  events,
  onTaskCreated,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [linkedEventId, setLinkedEventId] = useState("general");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUserIds, setAssigneeUserIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<TaskVisibility[]>(["team_only"]);
  const [status, setStatus] = useState<WeddingTasksBoardStatus>("todo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("high");
    setLinkedEventId("general");
    setDueDate("");
    setAssigneeUserIds([]);
    setVisibility(["team_only"]);
    setStatus("todo");
    setError(null);
  }

  function toggleVisibility(item: TaskVisibility) {
    setVisibility((current) => {
      if (current.includes(item)) {
        if (current.length === 1) return current;
        return current.filter((entry) => entry !== item);
      }
      return [...current, item];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          linkedEventId: linkedEventId === "general" ? null : linkedEventId,
          dueDate: dueDate || null,
          assigneeUserIds,
          visibility,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create task.");
      }

      resetForm();
      onTaskCreated();
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-[520px]">
        <DialogHeader className="border-b border-border/60 px-6 pt-5 pb-4">
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Create a task for this wedding, assign it, and link it to an event.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <div className="max-h-[64vh] space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Task title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Confirm dhol band for Baraat entry" className="h-11" />
            </div>
            <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Description / notes</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context, vendor contacts, or specific requirements..."
              className="min-h-20 resize-none"
            />
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Priority & event</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {PRIORITY_OPTIONS.map((item) => {
                  const selected = priority === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPriority(item.id)}
                      className={`flex flex-col rounded-xl border p-3 text-left text-sm transition-colors ${priorityCardClass(item.id, selected)}`}
                    >
                      <span className={`font-semibold ${priorityTitleClass(item.id, selected)}`}>{item.label}</span>
                      <span className="mt-1 text-xs text-muted-foreground">{item.helper}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Linked event</label>
                  <Select
                    value={linkedEventId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setLinkedEventId(value);
                    }}
                  >
                    <SelectTrigger
                      className="h-11 w-full rounded-xl border-border/70 bg-muted/40 px-3"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General (no event)</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.label} - {event.dateLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Due date</label>
                  <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-11" />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Assignment</p>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Raised by</label>
                <div className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground flex items-center">
                  {currentUserLabel} (me)
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Assign to
                  {assigneeUserIds.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {assigneeUserIds.length}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const selected = assigneeUserIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() =>
                          setAssigneeUserIds((current) =>
                            current.includes(member.id)
                              ? current.filter((id) => id !== member.id)
                              : [...current, member.id],
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                          selected
                            ? "border-primary/60 bg-primary/15 text-primary"
                            : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        {selected && <Check className="size-3" />}
                        {member.isCurrentUser ? `${member.label} (you)` : member.label}
                        <span className="text-muted-foreground/60">· {roleLabel(member.role)}</span>
                      </button>
                    );
                  })}
                  {members.length === 0 && (
                    <p className="text-xs text-muted-foreground">No active members on this wedding yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Visibility</p>
              <div className="flex flex-wrap gap-2">
                {VISIBILITY_OPTIONS.map((item) => {
                  const selected = visibility.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleVisibility(item.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs ${
                        selected
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border/70 bg-background text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="mt-0 flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:gap-3">
            <Button type="submit" disabled={submitting || !title.trim()} className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90">
              {submitting ? "Creating..." : "Create task"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
