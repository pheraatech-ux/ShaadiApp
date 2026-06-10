"use client";

import { UserRound } from "lucide-react";

import { MemberProfileHeader } from "@/components/app-dashboard/team/member-profile-header";
import { MemberTaskList } from "@/components/app-dashboard/team/member-task-list";
import { TeamMemberSummary } from "@/components/app-dashboard/team/team-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MemberProfileModalProps = {
  member: TeamMemberSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberProfileModal({ member, open, onOpenChange }: MemberProfileModalProps) {
  const view = member
    ? {
        member,
        completionPercent: member.tasksTotal > 0 ? Math.round((member.tasksCompleted / member.tasksTotal) * 100) : 0,
        tasks: member.assignedTasks,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,48rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <div className="flex gap-3.5">
            <span className="flex w-12 shrink-0 self-stretch items-center justify-center rounded-xl bg-muted">
              <UserRound className="size-5 text-muted-foreground" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle className="truncate leading-snug">
                {member ? `Employee profile: ${member.name}` : "Employee profile"}
              </DialogTitle>
              <DialogDescription>Task ownership and progress across assigned weddings.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {view ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            <div className="space-y-3">
              <MemberProfileHeader view={view} showBackLink={false} compact />
              <MemberTaskList
                tasks={view.tasks}
                tasksCompleted={view.member.tasksCompleted}
                tasksTotal={view.member.tasksTotal}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
