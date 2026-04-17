"use client";

import Link from "next/link";
import { useState } from "react";

import { TaskProgressBar } from "@/components/dashboard/team/task-progress-bar";
import { TeamMemberSummary } from "@/components/dashboard/team/team-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TeamMembersTableProps = {
  members: TeamMemberSummary[];
  onInviteClick?: () => void;
  onCopyInviteLink?: (memberId: string) => Promise<void>;
  onResendInvite?: (memberId: string) => Promise<void>;
};

const statusClassName: Record<TeamMemberSummary["status"], string> = {
  online: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-100",
  away: "bg-amber-500/20 text-amber-700 dark:text-amber-100",
  offline: "bg-muted text-muted-foreground",
};

export function TeamMembersTable({ members, onInviteClick, onCopyInviteLink, onResendInvite }: TeamMembersTableProps) {
  const [busyAction, setBusyAction] = useState<{ memberId: string; action: "copy" | "resend" } | null>(null);

  const canRunAction = (memberId: string, action: "copy" | "resend") =>
    busyAction?.memberId === memberId && busyAction.action === action;

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-3">
        <CardTitle className="text-base">All team members</CardTitle>
        <Button
          size="sm"
          className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-600/90"
          onClick={onInviteClick}
        >
          + Invite
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {members.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            No team members yet. Invite your first teammate to start collaborating.
          </p>
        ) : (
          members.map((member) => (
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
                <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {member.employmentStatus}
                </span>
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
                {member.linkedUserId ? (
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
                ) : (
                  <div className="mt-1">
                    <TaskProgressBar completed={member.tasksCompleted} total={member.tasksTotal} />
                  </div>
                )}
                {member.overdueTasks > 0 ? (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">{member.overdueTasks} overdue tasks</p>
                ) : null}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", statusClassName[member.status])}>
                  {member.lastActive}
                </span>
                {member.employmentStatus === "invited" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-md px-2 text-xs"
                      disabled={canRunAction(member.id, "copy")}
                      onClick={async () => {
                        if (!onCopyInviteLink) return;
                        setBusyAction({ memberId: member.id, action: "copy" });
                        try {
                          await onCopyInviteLink(member.id);
                        } finally {
                          setBusyAction(null);
                        }
                      }}
                    >
                      {canRunAction(member.id, "copy") ? "Copying..." : "Copy link"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-md px-2 text-xs"
                      disabled={canRunAction(member.id, "resend")}
                      onClick={async () => {
                        if (!onResendInvite) return;
                        setBusyAction({ memberId: member.id, action: "resend" });
                        try {
                          await onResendInvite(member.id);
                        } finally {
                          setBusyAction(null);
                        }
                      }}
                    >
                      {canRunAction(member.id, "resend") ? "Resending..." : "Resend"}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 rounded-md px-2 text-xs">
                    Remind
                  </Button>
                )}
                {member.employmentStatus === "invited" && member.inviteExpiresAt ? (
                  <p className="text-[10px] text-muted-foreground">
                    Expires {new Date(member.inviteExpiresAt).toLocaleDateString("en-GB")}
                  </p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
