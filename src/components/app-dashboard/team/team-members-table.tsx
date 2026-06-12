"use client";

import { Calendar, ContactRound, Heart, ListTodo, Mail, Phone, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { TaskProgressBar } from "@/components/app-dashboard/team/task-progress-bar";
import { TeamMemberSummary } from "@/components/app-dashboard/team/team-types";
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
    <>Remove {name} from your team? This cannot be undone.</>
  );
}

type TeamMembersTableProps = {
  members: TeamMemberSummary[];
  currentUserId: string;
  businessName: string;
  showActionsColumn?: boolean;
  onInviteClick?: () => void;
  onMemberClick?: (memberId: string) => void;
  onCopyInviteLink?: (memberId: string) => Promise<void>;
  onGenerateNewInviteLink?: (memberId: string) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
  onMessageMember?: (memberId: string) => Promise<void>;
};

function MemberSinceBadge({ label, className }: { label: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300",
        className,
      )}
    >
      <Calendar className="size-3 shrink-0 text-violet-500" aria-hidden />
      {label}
    </Badge>
  );
}

type SectionAccent = "sky" | "rose" | "amber" | "emerald";

const SECTION_ACCENTS: Record<SectionAccent, { iconBg: string; iconClass: string }> = {
  sky: { iconBg: "bg-sky-500/12 dark:bg-sky-500/18", iconClass: "text-sky-500" },
  rose: { iconBg: "bg-rose-500/12 dark:bg-rose-500/18", iconClass: "text-rose-500" },
  amber: { iconBg: "bg-amber-500/12 dark:bg-amber-500/18", iconClass: "text-amber-500" },
  emerald: { iconBg: "bg-emerald-500/12 dark:bg-emerald-500/18", iconClass: "text-emerald-500" },
};

const AVATAR_PALETTES = [
  { bg: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-400/30" },
  { bg: "bg-rose-500/15 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-400/30" },
  { bg: "bg-sky-500/15 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-400/30" },
  { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-400/30" },
  { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-400/30" },
];

function avatarPaletteForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[Math.abs(hash)];
}

const MAX_VISIBLE_WEDDING_PILLS = 3;
const MAX_VISIBLE_WEDDING_PILLS_COMPACT = 2;

const weddingPillClassName =
  "h-auto min-h-6 max-w-full truncate rounded-md px-2.5 py-1 text-[10px] leading-snug";
const weddingMoreClassName =
  "h-auto min-h-6 shrink-0 rounded-md px-2.5 py-1 text-[10px] leading-snug text-muted-foreground";

function ActiveWeddingPills({ weddings }: { weddings: string[] }) {
  if (weddings.length === 0) {
    return <p className="min-h-14 text-xs text-muted-foreground">None</p>;
  }

  const visibleWide = weddings.slice(0, MAX_VISIBLE_WEDDING_PILLS);
  const overflowWide = weddings.length - visibleWide.length;
  const overflowCompact = Math.max(0, weddings.length - MAX_VISIBLE_WEDDING_PILLS_COMPACT);

  return (
    <>
      <div className="flex min-h-14 flex-col justify-start gap-1 min-[1440px]:hidden">
        {weddings[0] ? (
          <Badge variant="secondary" className={weddingPillClassName}>
            {weddings[0]}
          </Badge>
        ) : null}
        {weddings[1] || overflowCompact > 0 ? (
          <div className="flex flex-wrap items-center gap-1">
            {weddings[1] ? (
              <Badge variant="secondary" className={weddingPillClassName}>
                {weddings[1]}
              </Badge>
            ) : null}
            {overflowCompact > 0 ? (
              <Badge variant="secondary" className={weddingMoreClassName}>
                +{overflowCompact} more
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="hidden min-h-14 flex-wrap content-start gap-1 min-[1440px]:flex">
        {visibleWide.map((wedding) => (
          <Badge key={wedding} variant="secondary" className={weddingPillClassName}>
            {wedding}
          </Badge>
        ))}
        {overflowWide > 0 ? (
          <Badge variant="secondary" className={weddingMoreClassName}>
            +{overflowWide} more
          </Badge>
        ) : null}
      </div>
    </>
  );
}

function CardSectionTitle({
  icon: Icon,
  children,
  className,
  accent = "emerald",
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  className?: string;
  accent?: SectionAccent;
}) {
  const { iconBg, iconClass } = SECTION_ACCENTS[accent];
  return (
    <p
      className={cn(
        "mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ring-black/5 dark:ring-white/8",
          iconBg,
        )}
      >
        <Icon className={cn("size-3", iconClass)} aria-hidden />
      </span>
      {children}
    </p>
  );
}

function memberIsCurrentUser(member: TeamMemberSummary, currentUserId: string) {
  return member.id === currentUserId || member.linkedUserId === currentUserId;
}

const DEFAULT_WORKSPACE_NAME = "ShaadiOS Workspace";

function teamMembersTitle(businessName: string) {
  const trimmed = businessName.trim();
  if (!trimmed || trimmed === DEFAULT_WORKSPACE_NAME) {
    return "Team members";
  }
  return `${trimmed}'s team members`;
}

type MemberCardActionsProps = {
  member: TeamMemberSummary;
  currentUserId: string;
  showActions: boolean;
  busyAction: { memberId: string; action: "copy" | "new-link" } | null;
  busyMessageId: string | null;
  busyDeleteId: string | null;
  onCopyInviteLink?: (memberId: string) => Promise<void>;
  onGenerateNewInviteLink?: (memberId: string) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
  onMessageMember?: (memberId: string) => Promise<void>;
  onDeleteClick: (member: TeamMemberSummary) => void;
  setBusyAction: (action: { memberId: string; action: "copy" | "new-link" } | null) => void;
  setBusyMessageId: (id: string | null) => void;
};

function MemberCardActions({
  member,
  currentUserId,
  showActions,
  busyAction,
  busyMessageId,
  busyDeleteId,
  onCopyInviteLink,
  onGenerateNewInviteLink,
  onDeleteMember,
  onMessageMember,
  onDeleteClick,
  setBusyAction,
  setBusyMessageId,
}: MemberCardActionsProps) {
  if (!showActions) return null;

  const canRunAction = (action: "copy" | "new-link") =>
    busyAction?.memberId === member.id && busyAction.action === action;

  return (
    <div
      className="mt-4 border-t border-border/60 pt-3"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {member.employmentStatus === "invited" ? (
        onCopyInviteLink || onGenerateNewInviteLink || onDeleteMember ? (
          <div className="flex flex-wrap items-center gap-2">
            {onCopyInviteLink ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2 text-xs"
                disabled={canRunAction("copy")}
                onClick={async () => {
                  setBusyAction({ memberId: member.id, action: "copy" });
                  try {
                    await onCopyInviteLink(member.id);
                  } finally {
                    setBusyAction(null);
                  }
                }}
              >
                {canRunAction("copy") ? "Copying..." : "Copy link"}
              </Button>
            ) : null}
            {onGenerateNewInviteLink ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2 text-xs"
                disabled={canRunAction("new-link")}
                onClick={async () => {
                  setBusyAction({ memberId: member.id, action: "new-link" });
                  try {
                    await onGenerateNewInviteLink(member.id);
                  } finally {
                    setBusyAction(null);
                  }
                }}
              >
                {canRunAction("new-link") ? "Generating..." : "New link"}
              </Button>
            ) : null}
            {member.deletable && onDeleteMember ? (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={busyDeleteId === member.id}
                aria-label={`Remove ${member.name}`}
                onClick={() => onDeleteClick(member)}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Invite pending</span>
        )
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 rounded-md px-2 text-xs">
            Remind
          </Button>
          {onMessageMember && !memberIsCurrentUser(member, currentUserId) && member.linkedUserId ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-md px-2 text-xs"
              disabled={busyMessageId === member.id}
              onClick={async () => {
                setBusyMessageId(member.id);
                try {
                  await onMessageMember(member.id);
                } finally {
                  setBusyMessageId(null);
                }
              }}
            >
              {busyMessageId === member.id ? "Opening…" : "Message"}
            </Button>
          ) : null}
          {member.deletable ? (
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={busyDeleteId === member.id}
              aria-label={`Remove ${member.name}`}
              onClick={() => {
                if (!onDeleteMember) return;
                onDeleteClick(member);
              }}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          ) : null}
        </div>
      )}
      {member.employmentStatus === "invited" && member.inviteExpiresAt ? (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Expires {new Date(member.inviteExpiresAt).toLocaleDateString("en-GB")}
        </p>
      ) : null}
    </div>
  );
}

type TeamMemberCardProps = {
  member: TeamMemberSummary;
  currentUserId: string;
  showActions: boolean;
  busyAction: { memberId: string; action: "copy" | "new-link" } | null;
  busyMessageId: string | null;
  busyDeleteId: string | null;
  onMemberClick?: (memberId: string) => void;
  onCopyInviteLink?: (memberId: string) => Promise<void>;
  onGenerateNewInviteLink?: (memberId: string) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
  onMessageMember?: (memberId: string) => Promise<void>;
  onDeleteClick: (member: TeamMemberSummary) => void;
  setBusyAction: (action: { memberId: string; action: "copy" | "new-link" } | null) => void;
  setBusyMessageId: (id: string | null) => void;
};

function TeamMemberCard({
  member,
  currentUserId,
  showActions,
  busyAction,
  busyMessageId,
  busyDeleteId,
  onMemberClick,
  onCopyInviteLink,
  onGenerateNewInviteLink,
  onDeleteMember,
  onMessageMember,
  onDeleteClick,
  setBusyAction,
  setBusyMessageId,
}: TeamMemberCardProps) {
  const isYou = memberIsCurrentUser(member, currentUserId);
  const nameLabel = isYou ? `${member.name} (You)` : member.name;
  const avatarPalette = avatarPaletteForName(member.name);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card px-5 py-4 transition-all",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
        "cursor-pointer hover:border-emerald-500/25 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),_0_8px_24px_rgba(0,0,0,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
      )}
      tabIndex={0}
      role="button"
      aria-label={`Open ${nameLabel} profile`}
      onClick={() => onMemberClick?.(member.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMemberClick?.(member.id);
        }
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className="-mx-5 -mt-4 mb-4 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-5 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className={cn("size-12 shrink-0 ring-2", avatarPalette.ring)}>
              <AvatarFallback className={cn("text-sm font-semibold", avatarPalette.bg, avatarPalette.text)}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <p className="truncate text-sm font-semibold leading-snug">{member.name}</p>
                {isYou ? <span className="shrink-0 text-xs font-medium text-muted-foreground">(You)</span> : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{member.roleLabel}</p>
            </div>
          </div>
          {member.memberSinceLabel ? (
            <MemberSinceBadge label={member.memberSinceLabel} className="hidden min-[1440px]:inline-flex" />
          ) : null}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-0 border-b border-border/60 pb-4">
        <div className="min-w-0 border-r border-border/60 pr-3">
          <CardSectionTitle icon={ContactRound} accent="sky">
            Contact Info
          </CardSectionTitle>
          <div className="space-y-1.5 pl-0.5">
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              <Mail className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{member.email}</span>
            </a>
            {member.phone ? (
              <a
                href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 truncate text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                <Phone className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{member.phone}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 pl-3">
          <CardSectionTitle icon={Heart} accent="rose">
            Active weddings
          </CardSectionTitle>
          <ActiveWeddingPills weddings={member.activeWeddings} />
        </div>
      </div>

      <div className="flex-1">
        <CardSectionTitle icon={ListTodo} accent="amber">
          Tasks this month
        </CardSectionTitle>
        <TaskProgressBar
          completed={member.tasksCompleted}
          total={member.tasksTotal}
          overdueTasks={member.overdueTasks}
        />
      </div>

      <MemberCardActions
        member={member}
        currentUserId={currentUserId}
        showActions={showActions}
        busyAction={busyAction}
        busyMessageId={busyMessageId}
        busyDeleteId={busyDeleteId}
        onCopyInviteLink={onCopyInviteLink}
        onGenerateNewInviteLink={onGenerateNewInviteLink}
        onDeleteMember={onDeleteMember}
        onMessageMember={onMessageMember}
        onDeleteClick={onDeleteClick}
        setBusyAction={setBusyAction}
        setBusyMessageId={setBusyMessageId}
      />
    </article>
  );
}

function InviteTeamMemberCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "group flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-xl",
        "border border-dashed border-emerald-400/40 bg-muted/10 px-6 py-8 text-center transition-all",
        "hover:border-emerald-500/50 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
      )}
      onClick={onClick}
    >
      <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-emerald-400/40 bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/15">
        <UserPlus className="size-5 text-emerald-500" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Invite teammate</p>
        <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
          Add someone to your company team and assign them to weddings.
        </p>
      </div>
      <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors group-hover:bg-emerald-600/90">
        + Invite
      </span>
    </button>
  );
}

export function TeamMembersTable({
  members,
  currentUserId,
  businessName,
  showActionsColumn = true,
  onInviteClick,
  onMemberClick,
  onCopyInviteLink,
  onGenerateNewInviteLink,
  onDeleteMember,
  onMessageMember,
}: TeamMembersTableProps) {
  const [busyAction, setBusyAction] = useState<{ memberId: string; action: "copy" | "new-link" } | null>(null);
  const [busyMessageId, setBusyMessageId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberSummary | null>(null);

  return (
    <Card className="gap-0 rounded-2xl border-border/70 pb-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/70 pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15">
            <Users className="size-5 text-emerald-500" aria-hidden />
          </div>
          {teamMembersTitle(businessName)}
        </CardTitle>
        {onInviteClick ? (
          <Button
            size="sm"
            className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={onInviteClick}
          >
            + Invite
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {members.length === 0 ? (
          <div className="m-4 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-emerald-400/40 bg-emerald-500/10">
              <Users className="size-4 text-emerald-500" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No team members yet</p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Invite your first teammate to start collaborating.
              </p>
            </div>
            {onInviteClick ? (
              <Button
                size="sm"
                className="mt-1 rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-600/90"
                onClick={onInviteClick}
              >
                <UserPlus className="size-4" />
                Invite teammate
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                showActions={showActionsColumn}
                busyAction={busyAction}
                busyMessageId={busyMessageId}
                busyDeleteId={busyDeleteId}
                onMemberClick={onMemberClick}
                onCopyInviteLink={onCopyInviteLink}
                onGenerateNewInviteLink={onGenerateNewInviteLink}
                onDeleteMember={onDeleteMember}
                onMessageMember={onMessageMember}
                onDeleteClick={setDeleteTarget}
                setBusyAction={setBusyAction}
                setBusyMessageId={setBusyMessageId}
              />
            ))}
            {onInviteClick && members.length <= 2 ? (
              <InviteTeamMemberCard onClick={onInviteClick} />
            ) : null}
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
