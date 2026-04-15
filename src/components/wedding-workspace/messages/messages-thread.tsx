"use client";

import type { WeddingMessageItem } from "@/components/wedding-workspace/messages/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type MessagesThreadProps = {
  messages: WeddingMessageItem[];
};

function formatMessageTimestamp(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesThread({ messages }: MessagesThreadProps) {
  if (!messages.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          No messages yet in this view. Start a conversation using the composer below.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border/70 bg-background p-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex items-end gap-2", message.isCurrentUser ? "justify-end" : "justify-start")}
        >
          {!message.isCurrentUser ? (
            <Avatar size="sm">
              <AvatarFallback>{message.authorInitials}</AvatarFallback>
            </Avatar>
          ) : null}
          <div className={cn("max-w-[80%] space-y-1", message.isCurrentUser ? "items-end text-right" : "text-left")}>
            <p className="text-xs text-muted-foreground">{message.isCurrentUser ? "You" : message.authorLabel}</p>
            <div
              className={cn(
                "rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                message.isCurrentUser
                  ? "rounded-br-sm bg-emerald-600 text-white"
                  : "rounded-bl-sm border border-border/70 bg-card text-card-foreground",
              )}
            >
              {message.body}
            </div>
            <p className="text-[11px] text-muted-foreground">{formatMessageTimestamp(message.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
