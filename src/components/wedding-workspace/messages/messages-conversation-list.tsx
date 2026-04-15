"use client";

import { MessageSquare } from "lucide-react";

import type { WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MessagesConversationListProps = {
  threads: WeddingMessagesWorkspaceViewModel["threads"];
  search: string;
  onSearchChange: (value: string) => void;
  selectedThreadId: string | null;
  onSelectThreadId: (id: string) => void;
};

function formatPreviewTimestamp(value: string | null) {
  if (!value) return "No messages yet";
  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesConversationList({
  threads,
  search,
  onSearchChange,
  selectedThreadId,
  onSelectThreadId,
}: MessagesConversationListProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">All conversations</p>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search thread..."
          className="mt-2 h-9"
        />
      </div>

      <div className="min-h-0 space-y-1 overflow-y-auto pr-1">
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => onSelectThreadId(thread.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
              selectedThreadId === thread.id
                ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                : "border-border/60 bg-background hover:bg-muted/40",
            )}
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{thread.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {thread.participantLabels.slice(0, 2).join(", ") || "No members"}
                {thread.participantLabels.length > 2 ? ` +${thread.participantLabels.length - 2}` : ""}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{formatPreviewTimestamp(thread.lastMessageAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={thread.isDefault ? "secondary" : "outline"}>
                {thread.isDefault ? "Default" : "Thread"}
              </Badge>
              {thread.messageCount > 0 ? (
                <span className="text-xs text-muted-foreground">{thread.messageCount}</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
