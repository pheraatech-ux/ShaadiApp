"use client";

import { Mail } from "lucide-react";

import type { WeddingMessageParticipant, WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ActiveThread = WeddingMessagesWorkspaceViewModel["threads"][number];

type MessagesThreadHeaderProps = {
  thread: ActiveThread;
  currentUserId: string;
  participants: WeddingMessageParticipant[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-700",
  "bg-sky-500/20 text-sky-700",
  "bg-amber-500/20 text-amber-700",
  "bg-emerald-500/20 text-emerald-700",
  "bg-rose-500/20 text-rose-700",
];

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function MessagesThreadHeader({ thread, currentUserId, participants }: MessagesThreadHeaderProps) {
  const isDm = !thread.isDefault && thread.participantIds.length === 2;

  const avatarLabels = isDm ? [thread.title] : thread.participantLabels.slice(0, 3);

  const groupSubtitle = !isDm
    ? thread.participantLabels.length > 0
      ? thread.participantLabels.join(", ")
      : "No members"
    : null;

  const participantById = new Map(participants.map((p) => [p.id, p]));
  const threadParticipants = thread.participantIds
    .map((id) => participantById.get(id))
    .filter(Boolean) as WeddingMessageParticipant[];

  return (
    <Popover>
      <PopoverTrigger className="flex w-full min-w-0 cursor-pointer items-center gap-3 text-left">
          <div className="relative flex shrink-0 items-center">
            {avatarLabels.length > 0 ? (
              avatarLabels.map((label, i) => (
                <Avatar
                  key={i}
                  size="default"
                  className={i > 0 ? "-ml-3 ring-2 ring-background" : ""}
                >
                  <AvatarFallback className={avatarColor(i)}>{getInitials(label)}</AvatarFallback>
                </Avatar>
              ))
            ) : (
              <Avatar size="default">
                <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center">
            {groupSubtitle ? (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{thread.title}</p>
                <p className="truncate text-xs text-muted-foreground">{groupSubtitle}</p>
              </div>
            ) : (
              <p className="truncate text-base font-semibold text-foreground">{thread.title}</p>
            )}
          </div>

          {!isDm && (
            <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {thread.participantIds.length} members
            </span>
          )}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 gap-0 p-0">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold">{isDm ? "Direct message" : thread.title}</p>
          <p className="text-xs text-muted-foreground">
            {threadParticipants.length} {threadParticipants.length === 1 ? "participant" : "participants"}
          </p>
        </div>
        <ul className="divide-y divide-border/50">
          {threadParticipants.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar size="sm">
                <AvatarFallback className={avatarColor(i)}>{p.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {p.label}
                  {p.id === currentUserId && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
                {p.email ? (
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="size-3 shrink-0" />
                    {p.email}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50">No email on record</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
