import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { TaskProgressBar } from "@/components/app-dashboard/team/task-progress-bar";
import { TeamTaskItem } from "@/components/app-dashboard/team/team-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MemberTaskListProps = {
  tasks: TeamTaskItem[];
  tasksCompleted: number;
  tasksTotal: number;
};

const taskStatusTone: Record<TeamTaskItem["status"], string> = {
  done: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-100",
  "in-progress": "bg-blue-500/20 text-blue-700 dark:text-blue-100",
  overdue: "bg-red-500/20 text-red-700 dark:text-red-100",
};

const taskStatusLabel: Record<TeamTaskItem["status"], string> = {
  done: "Done",
  "in-progress": "In progress",
  overdue: "Overdue",
};

export function MemberTaskList({ tasks, tasksCompleted, tasksTotal }: MemberTaskListProps) {
  return (
    <Card className="gap-0 rounded-2xl border-border/70 py-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 border-b border-border/70 px-4 py-3 [.border-b]:pb-3">
        <CardTitle className="text-base">Assigned tasks</CardTitle>
        <TaskProgressBar completed={tasksCompleted} total={tasksTotal} layout="inline" />
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {tasks.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">No assigned tasks yet.</p>
        ) : (
          tasks.map((task) => {
            const row = (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.weddingLabel} • {task.dueLabel}
                  </p>
                </div>
                <Badge className={cn("shrink-0 rounded-full text-[10px]", taskStatusTone[task.status])}>
                  {taskStatusLabel[task.status]}
                </Badge>
                {task.href ? (
                  <ChevronRight
                    className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                ) : null}
              </>
            );

            const rowClass = cn(
              "group flex items-center gap-2 border-b border-border/60 px-4 py-2.5 last:border-none",
              task.href && "transition-colors hover:bg-muted/40",
            );

            return task.href ? (
              <Link key={task.id} href={task.href} className={rowClass}>
                {row}
              </Link>
            ) : (
              <article key={task.id} className={rowClass}>
                {row}
              </article>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
