"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, List, MessageSquare } from "lucide-react";

import type { TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";
import { TaskProgressBar } from "@/components/app-dashboard/team/task-progress-bar";
import { WorkspaceCoupleHeader } from "@/components/wedding-workspace/overview/workspace-couple-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

type EmployeeWorkspaceTeamViewProps = {
  view: TeamPageViewModel;
};

export function EmployeeWorkspaceTeamView({ view }: EmployeeWorkspaceTeamViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");

  const activeMembers = view.members.filter((m) => m.status !== "placeholder");
  const messagesHref = `/app/employee/weddings/${view.weddingId}/messages`;

  function goToProfile(userId: string | null) {
    if (!userId) return;
    router.push(`/app/employee/team/${userId}`);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <WorkspaceCoupleHeader
          avatarLabel={view.avatarLabel}
          coupleName={view.coupleName}
          subtitleLine={view.venueLine}
          cultureTags={view.cultureTags}
        />
        <Link
          href={`/app/employee/weddings/${view.weddingId}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 self-start rounded-xl" })}
        >
          Back to overview
        </Link>
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Team for this wedding
          </CardTitle>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{view.memberCountLabel}</p>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
          <CardTitle className="text-sm">Members</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border/70 p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => setViewMode("cards")}
              aria-label="Cards view"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </CardHeader>

        {activeMembers.length === 0 ? (
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No team members assigned to this wedding yet.
          </CardContent>
        ) : viewMode === "list" ? (
          <CardContent className="divide-y divide-border/60 p-0">
            {activeMembers.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  m.userId ? "cursor-pointer hover:bg-muted/40 transition-colors" : "",
                )}
                onClick={() => goToProfile(m.userId)}
              >
                <Avatar className="size-10 shrink-0 border border-border/60">
                  <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>
                    {m.avatarLabel}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.subtitle}</p>
                </div>
                <div className="hidden min-w-[140px] sm:block">
                  <TaskProgressBar completed={m.completedTaskCount} total={m.activeTaskCount} />
                  {m.overdueTaskCount > 0 && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">
                      {m.overdueTaskCount} overdue
                    </p>
                  )}
                </div>
                <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
                <Link
                  href={messagesHref}
                  onClick={(e) => e.stopPropagation()}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 shrink-0 rounded-lg px-2" })}
                >
                  <MessageSquare className="size-3.5" />
                  <span className="ml-1 text-xs">Message</span>
                </Link>
              </div>
            ))}
          </CardContent>
        ) : (
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeMembers.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-4",
                    m.userId ? "cursor-pointer hover:bg-muted/40 transition-colors" : "",
                  )}
                  onClick={() => goToProfile(m.userId)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0 border border-border/60">
                      <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>
                        {m.avatarLabel}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.subtitle}</p>
                    </div>
                    <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
                  </div>
                  <TaskProgressBar completed={m.completedTaskCount} total={m.activeTaskCount} />
                  {m.overdueTaskCount > 0 && (
                    <p className="text-xs font-medium text-red-600 dark:text-red-300">
                      {m.overdueTaskCount} overdue tasks
                    </p>
                  )}
                  <Link
                    href={messagesHref}
                    onClick={(e) => e.stopPropagation()}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 w-full rounded-lg" })}
                  >
                    <MessageSquare className="size-3.5" />
                    <span className="ml-1 text-xs">Message</span>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
