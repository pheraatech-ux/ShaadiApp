import Link from "next/link";

import { TaskProgressBar } from "@/components/dashboard/team/task-progress-bar";
import { TeamMemberSummary } from "@/components/dashboard/team/team-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TeamMembersTableProps = {
  members: TeamMemberSummary[];
};

const statusClassName: Record<TeamMemberSummary["status"], string> = {
  online: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-100",
  away: "bg-amber-500/20 text-amber-700 dark:text-amber-100",
  offline: "bg-muted text-muted-foreground",
};

export function TeamMembersTable({ members }: TeamMembersTableProps) {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-3">
        <CardTitle className="text-base">All team members</CardTitle>
        <Button size="sm" className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-600/90">
          + Invite
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {members.map((member) => (
          <article
            key={member.id}
            className="grid gap-3 border-b border-border/60 px-4 py-4 last:border-none xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-10 border border-border/70">
                <AvatarFallback className="text-xs font-semibold">{member.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email} • {member.phone}
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Business role</p>
              <p className="mt-1 text-sm font-medium">{member.roleLabel}</p>
            </div>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active weddings</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {member.activeWeddings.map((wedding) => (
                  <Badge key={wedding} variant="secondary" className="rounded-full text-[10px]">
                    {wedding}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasks this month</p>
              <Link
                href={`/app/team/${member.id}`}
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    className: "mt-1 h-auto w-full justify-start rounded-lg px-0 py-0 hover:bg-transparent",
                  }),
                )}
              >
                <TaskProgressBar completed={member.tasksCompleted} total={member.tasksTotal} />
              </Link>
              {member.overdueTasks > 0 ? (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">{member.overdueTasks} overdue tasks</p>
              ) : null}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", statusClassName[member.status])}>
                {member.lastActive}
              </span>
              <Button size="sm" variant="outline" className="h-7 rounded-md px-2 text-xs">
                Remind
              </Button>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
