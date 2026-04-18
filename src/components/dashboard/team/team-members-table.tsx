"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TaskProgressBar } from "@/components/dashboard/team/task-progress-bar";
import { TeamMemberSummary } from "@/components/dashboard/team/team-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function RemoveMemberDescription({ member }: { member: TeamMemberSummary }) {
  const name = <strong className="font-semibold text-foreground">{member.name}</strong>;
  return member.employmentStatus === "invited" ? (
    <>
      Remove {name} from your team? Their invite and record will be deleted. <br></br>This cannot be undone.
    </>
  ) : (
    <>
      Remove {name} from your team? This cannot be undone.
    </>
  );
}

type TeamMembersTableProps = {
  members: TeamMemberSummary[];
  onInviteClick?: () => void;
  onCopyInviteLink?: (memberId: string) => Promise<void>;
  onGenerateNewInviteLink?: (memberId: string) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
};

const statusClassName: Record<TeamMemberSummary["status"], string> = {
  online: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-100",
  away: "bg-amber-500/20 text-amber-700 dark:text-amber-100",
  offline: "bg-muted text-muted-foreground",
};

export function TeamMembersTable({
  members,
  onInviteClick,
  onCopyInviteLink,
  onGenerateNewInviteLink,
  onDeleteMember,
}: TeamMembersTableProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<{ memberId: string; action: "copy" | "new-link" } | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberSummary | null>(null);

  const canRunAction = (memberId: string, action: "copy" | "new-link") =>
    busyAction?.memberId === memberId && busyAction.action === action;

  return (
    <Card className="gap-0 rounded-2xl border-border/70 pb-0">
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
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No team members yet. Invite your first teammate to start collaborating.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/25 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="w-[22%] px-4 py-3 text-center font-medium">
                    Team member
                  </th>
                  <th scope="col" className="w-[13%] px-4 py-3 text-center font-medium">
                    Business role
                  </th>
                  <th scope="col" className="w-[15%] px-4 py-3 text-center font-medium">
                    Active weddings
                  </th>
                  <th scope="col" className="w-[18%] px-4 py-3 text-center font-medium">
                    Tasks this month
                  </th>
                  <th scope="col" className="w-[12%] px-4 py-3 text-center font-medium">
                    Last active
                  </th>
                  <th scope="col" className="w-[20%] px-4 py-3 text-center font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-none hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    tabIndex={0}
                    role="link"
                    aria-label={`Open ${member.name} profile`}
                    onClick={() => router.push(`/app/team/${member.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/app/team/${member.id}`);
                      }
                    }}
                  >
                    <td className="px-4 py-5 align-middle text-left">
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar className="size-10 shrink-0 border border-border/70">
                          <AvatarFallback className="text-xs font-semibold">{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-[14rem] flex flex-col items-start gap-0.5 text-left">
                          <p className="break-words text-sm font-semibold leading-snug">{member.name}</p>
                          <a
                            href={`mailto:${member.email}`}
                            className="break-all text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {member.email}
                          </a>
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                              className="break-all text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {member.phone}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex min-w-0 flex-col items-center justify-center gap-1.5 text-center">
                        <p className="text-sm font-medium leading-snug">{member.roleLabel}</p>
                        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {member.employmentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex min-w-0 flex-col items-center justify-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {member.activeWeddings.map((wedding) => (
                            <Badge key={wedding} variant="secondary" className="rounded-full text-[10px]">
                              {wedding}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex min-w-0 flex-col items-center justify-center gap-1 text-center">
                        <div className="mx-auto w-[12rem] shrink-0">
                          <TaskProgressBar
                            completed={member.tasksCompleted}
                            total={member.tasksTotal}
                            className="w-full text-center [&_p]:text-center"
                          />
                        </div>
                        {member.overdueTasks > 0 ? (
                          <p className="text-xs font-medium text-red-600 dark:text-red-300">{member.overdueTasks} overdue tasks</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle">
                      <div className="flex min-w-0 flex-col items-center justify-center text-center">
                        <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", statusClassName[member.status])}>
                          {member.lastActive}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 align-middle" onClick={(event) => event.stopPropagation()}>
                      <div className="flex min-w-0 flex-col items-center justify-center gap-2 text-center">
                        {member.employmentStatus === "invited" ? (
                          <div className="flex flex-wrap items-center justify-center gap-2">
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
                              disabled={canRunAction(member.id, "new-link")}
                              onClick={async () => {
                                if (!onGenerateNewInviteLink) return;
                                setBusyAction({ memberId: member.id, action: "new-link" });
                                try {
                                  await onGenerateNewInviteLink(member.id);
                                } finally {
                                  setBusyAction(null);
                                }
                              }}
                            >
                              {canRunAction(member.id, "new-link") ? "Generating..." : "New link"}
                            </Button>
                            {member.deletable ? (
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={busyDeleteId === member.id}
                                aria-label={`Remove ${member.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (!onDeleteMember) return;
                                  setDeleteTarget(member);
                                }}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 rounded-md px-2 text-xs">
                              Remind
                            </Button>
                            {member.deletable ? (
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={busyDeleteId === member.id}
                                aria-label={`Remove ${member.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (!onDeleteMember) return;
                                  setDeleteTarget(member);
                                }}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </Button>
                            ) : null}
                          </div>
                        )}
                        {member.employmentStatus === "invited" && member.inviteExpiresAt ? (
                          <p className="text-[10px] text-muted-foreground">
                            Expires {new Date(member.inviteExpiresAt).toLocaleDateString("en-GB")}
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive" aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? <RemoveMemberDescription member={deleteTarget} /> : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyDeleteId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busyDeleteId !== null || !deleteTarget}
              onClick={async (event) => {
                event.preventDefault();
                if (!deleteTarget || !onDeleteMember) return;
                setBusyDeleteId(deleteTarget.id);
                try {
                  await onDeleteMember(deleteTarget.id);
                  setDeleteTarget(null);
                } finally {
                  setBusyDeleteId(null);
                }
              }}
            >
              {busyDeleteId && deleteTarget && busyDeleteId === deleteTarget.id ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
