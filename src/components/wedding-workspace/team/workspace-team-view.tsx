"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";

import { InviteTeamMemberDialog } from "@/components/wedding-workspace/team/invite-team-member-dialog";
import type { TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";
import { TaskProgressBar } from "@/components/dashboard/team/task-progress-bar";
import { WorkspaceCoupleHeader } from "@/components/wedding-workspace/workspace-couple-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type WorkspaceTeamViewProps = {
  view: TeamPageViewModel;
  defaultInviteOpen?: boolean;
};

export function WorkspaceTeamView({ view, defaultInviteOpen = false }: WorkspaceTeamViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(defaultInviteOpen);
  const clearedInviteQuery = useRef(false);

  useEffect(() => {
    if (!defaultInviteOpen || clearedInviteQuery.current) return;
    clearedInviteQuery.current = true;
    router.replace(`/app/weddings/${view.weddingId}/team`, { scroll: false });
  }, [defaultInviteOpen, router, view.weddingId]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <WorkspaceCoupleHeader
          avatarLabel={view.avatarLabel}
          coupleName={view.coupleName}
          subtitleLine={view.venueLine}
          cultureTags={view.cultureTags}
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={`/app/weddings/${view.weddingId}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 rounded-xl" })}
          >
            Back to overview
          </Link>
          <Button size="sm" className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => setInviteOpen(true)}>
            + Invite member
          </Button>
        </div>
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Team for this wedding</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-pretty">{view.summaryDescription}</CardDescription>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-semibold tabular-nums text-foreground">{view.memberCountLabel}</p>
            <p className="text-xs text-muted-foreground">members</p>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        {view.kpis.map((kpi) => (
          <Card key={kpi.id} className="rounded-2xl border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.helperText}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border/60 p-0">
          {view.members.map((m) => (
            <div key={m.id} className="grid gap-3 px-4 py-3 xl:grid-cols-[1.2fr_1fr_auto_auto] xl:items-center">
              {m.status === "placeholder" ? (
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50">
                    <UserPlus className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 rounded-lg" onClick={() => setInviteOpen(true)}>
                    {m.rightLabel}
                  </Button>
                </div>
              ) : (
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10 shrink-0 border border-border/60">
                    <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>{m.avatarLabel}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                  </div>
                </div>
              )}

              {m.status === "placeholder" ? (
                <p className="text-xs text-muted-foreground">No active tasks yet</p>
              ) : (
                <div className="min-w-0">
                  <TaskProgressBar completed={m.completedTaskCount} total={m.activeTaskCount} />
                  {m.overdueTaskCount > 0 ? (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">
                      {m.overdueTaskCount} overdue tasks
                    </p>
                  ) : null}
                </div>
              )}

              {m.status === "placeholder" ? null : (
                <Select defaultValue={m.accessLevel}>
                  <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="full">Full access</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="removed">Remove</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {m.status === "placeholder" ? null : (
                <div className="flex items-center gap-2 justify-self-end">
                  <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-xs text-destructive hover:text-destructive">
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">About team access on the free plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Invites are sent via WhatsApp with a wedding-specific link. Members only see this wedding — not your other
            clients.
          </p>
          <p>
            Upgrading to{" "}
            <strong className="font-semibold text-foreground">ShaadiOS Pro (₹2,499)</strong> removes the 3-member limit
            across all weddings.
          </p>
        </CardContent>
      </Card>

      <InviteTeamMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
