"use client";

import type { WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ActiveThread = WeddingMessagesWorkspaceViewModel["threads"][number];

type MessagesThreadHeaderProps = {
  thread: ActiveThread;
  currentUserId: string;
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

export function MessagesThreadHeader({ thread, currentUserId: _currentUserId }: MessagesThreadHeaderProps) {
  const isDm = !thread.isDefault && thread.participantIds.length === 2;

  // participantLabels are sorted alphabetically; use them directly for avatars (order is decorative)
  // For DMs the thread title is already the other person's name (WhatsApp-style)
  const avatarLabels = isDm ? [thread.title] : thread.participantLabels.slice(0, 3);

  const groupSubtitle = !isDm
    ? thread.participantLabels.length > 0
      ? thread.participantLabels.join(", ")
      : "No members"
    : null;

  return (
    <div className="flex items-center gap-3">
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
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {thread.participantIds.length} members
        </span>
      )}
    </div>
  );
}
