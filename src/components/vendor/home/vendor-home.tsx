import Link from "next/link";
import { Calendar, CheckSquare, MessageSquare, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VendorTask = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  priority: string;
};

type VendorEvent = {
  id: string;
  title: string;
  event_date: string | null;
  culture_label: string | null;
};

type VendorHomeProps = {
  vendorName: string;
  vendorCategory: string;
  weddingCoupleName: string;
  weddingDate: string | null;
  plannerName: string;
  plannerInitials: string;
  tasks: VendorTask[];
  upcomingEvents: VendorEvent[];
  unreadMessages: number;
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  needs_review: "Needs review",
  done: "Done",
};

const STATUS_CLASSES: Record<string, string> = {
  todo: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  needs_review: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function VendorHome({
  vendorName,
  vendorCategory,
  weddingCoupleName,
  weddingDate,
  plannerName,
  plannerInitials,
  tasks,
  upcomingEvents,
  unreadMessages,
}: VendorHomeProps) {
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const nextEvent = upcomingEvents[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{vendorCategory}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{vendorName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {weddingCoupleName}
          {weddingDate ? ` · ${fmtDate(weddingDate)}` : ""}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-xl border-border/70">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Pending tasks</p>
            <p className="mt-1 text-2xl font-bold">{pendingTasks.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="mt-1 text-2xl font-bold">{doneTasks.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border/70">
          <CardContent className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="mt-1 text-2xl font-bold">{upcomingEvents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Next event */}
      {nextEvent && (
        <Card className="rounded-xl border-border/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Next event</CardTitle>
              <Calendar className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold">{nextEvent.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {nextEvent.event_date && (
                <p className="text-sm text-muted-foreground">{fmtDate(nextEvent.event_date)}</p>
              )}
              {nextEvent.culture_label && (
                <Badge variant="secondary" className="rounded-full text-xs">
                  {nextEvent.culture_label}
                </Badge>
              )}
            </div>
            <Link href="/vendor/events" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-3 -ml-2 rounded-lg text-xs")}>
              View all events
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Planner card */}
      <Card className="rounded-xl border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">Your planner</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
              {plannerInitials}
            </div>
            <div>
              <p className="text-sm font-medium">{plannerName}</p>
              {unreadMessages > 0 && (
                <p className="text-xs text-muted-foreground">{unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          <Link href="/vendor/messages" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl gap-1.5")}>
            <MessageSquare className="size-4" />
            Message
          </Link>
        </CardContent>
      </Card>

      {/* Pending tasks preview */}
      {pendingTasks.length > 0 && (
        <Card className="rounded-xl border-border/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Pending tasks</CardTitle>
              <CheckSquare className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.slice(0, 4).map((task) => (
              <Link
                key={task.id}
                href={`/vendor/tasks/${task.id}`}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
              >
                <p className="min-w-0 truncate text-sm font-medium">{task.title}</p>
                <Badge variant="outline" className={STATUS_CLASSES[task.status] ?? ""}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </Badge>
              </Link>
            ))}
            {pendingTasks.length > 4 && (
              <Link href="/vendor/tasks" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-full justify-start rounded-lg text-xs")}>
                +{pendingTasks.length - 4} more tasks
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && upcomingEvents.length === 0 && (
        <Card className="rounded-xl border-border/70">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Store className="mb-3 size-8 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="mt-1 text-xs text-muted-foreground/60">No pending tasks or upcoming events.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
