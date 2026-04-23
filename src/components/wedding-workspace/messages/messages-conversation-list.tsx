"use client";

import type { WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LastMessage = { authorLabel: string; body: string; isCurrentUser: boolean };

type MessagesConversationListProps = {
  threads: WeddingMessagesWorkspaceViewModel["threads"];
  threadLastMessage: Map<string, LastMessage>;
  search: string;
  onSearchChange: (value: string) => void;
  selectedThreadId: string | null;
  onSelectThreadId: (id: string) => void;
};

function formatPreviewTimestamp(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function firstName(label: string) {
  return label.split(" ")[0];
}

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-700",
  "bg-sky-500/20 text-sky-700",
  "bg-amber-500/20 text-amber-700",
  "bg-emerald-500/20 text-emerald-700",
  "bg-rose-500/20 text-rose-700",
];

function avatarColor(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function MessagesConversationList({
  threads,
  threadLastMessage,
  search,
  onSearchChange,
  selectedThreadId,
  onSelectThreadId,
}: MessagesConversationListProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 px-3 pt-3">
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search…"
          className="h-9"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {threads.map((thread) => {
          const timestamp = formatPreviewTimestamp(thread.lastMessageAt);
          const lastMsg = threadLastMessage.get(thread.id);
          const preview = lastMsg
            ? `${lastMsg.isCurrentUser ? "You" : firstName(lastMsg.authorLabel)}: ${lastMsg.body}`
            : null;
          const isSelected = selectedThreadId === thread.id;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelectThreadId(thread.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/50 px-3 py-5 text-left transition-colors",
                isSelected ? "bg-emerald-500/10 text-foreground" : "hover:bg-muted/40",
              )}
            >
              <Avatar size="default" className="shrink-0">
                <AvatarFallback className={avatarColor(thread.title)}>
                  {getInitials(thread.title)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-base font-semibold">{thread.title}</p>
                  {timestamp && (
                    <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {preview ?? "No messages yet"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
