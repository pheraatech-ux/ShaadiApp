import { TeamTaskItem } from "@/components/app-dashboard/team/team-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MemberTaskListProps = {
  tasks: TeamTaskItem[];
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

export function MemberTaskList({ tasks }: MemberTaskListProps) {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="border-b border-border/70 pb-3">
        <CardTitle className="text-base">Assigned tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {tasks.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No assigned tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3 last:border-none">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.weddingLabel} • {task.dueLabel}
                </p>
              </div>
              <Badge className={cn("rounded-full text-[10px]", taskStatusTone[task.status])}>
                {taskStatusLabel[task.status]}
              </Badge>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
