import Link from "next/link";

import { TaskProgressBar } from "@/components/app-dashboard/team/task-progress-bar";
import { TeamMemberProfileViewModel } from "@/components/app-dashboard/team/team-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MemberProfileHeaderProps = {
  view: TeamMemberProfileViewModel;
};

export function MemberProfileHeader({ view }: MemberProfileHeaderProps) {
  return (
    <Card className="rounded-2xl border-border/70">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12 border border-border/70">
            <AvatarFallback className="text-sm font-semibold">{view.member.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{view.member.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {view.member.roleLabel} • {view.member.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="w-full sm:w-56">
            <TaskProgressBar completed={view.member.tasksCompleted} total={view.member.tasksTotal} />
          </div>
          <div className="flex gap-2">
            <Link href="/app/team">
              <Button variant="outline" size="sm" className="rounded-lg">
                Back to teams
              </Button>
            </Link>
            <Button size="sm" className="rounded-lg bg-amber-500 text-amber-950 hover:bg-amber-400">
              Send reminder
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
