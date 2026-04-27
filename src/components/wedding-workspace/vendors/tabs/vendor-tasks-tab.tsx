"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

export type VendorTask = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "needs_review" | "done";
  due_date: string | null;
  priority: string;
  description: string | null;
  created_at: string;
};

type VendorTasksTabProps = {
  weddingSlug: string;
  vendorId: string;
  vendorHasJoined: boolean;
  onTaskClick: (task: VendorTask) => void;
};

const STATUS_CLASSES: Record<string, string> = {
  todo: "border-rose-500/40 bg-rose-500/10 text-rose-400",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  needs_review: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  needs_review: "Needs review",
  done: "Done",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const SECTION_LABEL = "mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

export function VendorTasksTab({ weddingSlug, vendorId, vendorHasJoined, onTaskClick }: VendorTasksTabProps) {
  const [tasks, setTasks] = useState<VendorTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorHasJoined) { setLoading(false); return; }
    fetch(`/api/weddings/${weddingSlug}/vendors/${vendorId}/tasks`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown) => setTasks(Array.isArray(data) ? (data as VendorTask[]) : []))
      .catch(() => toast.error("Failed to load tasks."))
      .finally(() => setLoading(false));
  }, [weddingSlug, vendorId, vendorHasJoined]);

  const pending = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-5 px-6 py-6">
      {!vendorHasJoined ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-12 text-center">
          <ClipboardList className="mb-3 size-8 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">Vendor hasn't joined yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Tasks can be assigned once they accept the invite.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-12 text-center">
          <ClipboardList className="mb-3 size-8 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">No tasks assigned</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Tasks you assign to this vendor will appear here.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className={SECTION_LABEL}>Active ({pending.length})</p>
              <div className="space-y-2">
                {pending.map((task) => (
                  <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <p className={SECTION_LABEL}>Completed ({done.length})</p>
              <div className="space-y-2 opacity-60">
                {done.map((task) => (
                  <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

function TaskRow({ task, onClick }: { task: VendorTask; onClick: () => void }) {
  const isPastDue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-left transition-colors hover:border-border hover:bg-muted/20"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
        )}
        {task.due_date && (
          <p className={`mt-1 text-xs ${isPastDue ? "text-destructive" : "text-muted-foreground"}`}>
            {isPastDue ? "Overdue · " : "Due "}
            {fmtDate(task.due_date)}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant="outline" className={STATUS_CLASSES[task.status] ?? ""}>
          {STATUS_LABELS[task.status] ?? task.status}
        </Badge>
        <span className="text-[10px] capitalize text-muted-foreground/60">{task.priority}</span>
      </div>
    </button>
  );
}
