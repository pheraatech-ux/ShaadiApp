"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageItem = {
  id: string;
  body: string;
  created_at: string;
  authorName: string;
  authorInitials: string;
  isCurrentUser: boolean;
};

type VendorMessagesProps = {
  threadId: string;
  plannerName: string;
  plannerInitials: string;
  messages: MessageItem[];
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function VendorMessages({ threadId, plannerName, plannerInitials, messages: initialMessages }: VendorMessagesProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const res = await fetch("/api/vendor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed, threadId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { message: { id: string; body: string; created_at: string } };
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            body: data.message.body,
            created_at: data.message.created_at,
            authorName: "You",
            authorInitials: "YO",
            isCurrentUser: true,
          },
        ]);
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar size="default">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {plannerInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{plannerName}</p>
          <p className="text-xs text-muted-foreground">Wedding planner</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border/70 bg-card p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="mb-3 size-8 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Send a message to your planner below.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showDate = !prevMsg || fmtDate(prevMsg.created_at) !== fmtDate(msg.created_at);
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="my-3 flex items-center gap-2">
                    <div className="flex-1 border-t border-border/50" />
                    <p className="text-[10px] text-muted-foreground">{fmtDate(msg.created_at)}</p>
                    <div className="flex-1 border-t border-border/50" />
                  </div>
                )}
                <div className={`flex gap-2.5 ${msg.isCurrentUser ? "flex-row-reverse" : ""}`}>
                  <Avatar size="sm" className="shrink-0 self-end">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                      {msg.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] flex flex-col ${msg.isCurrentUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.isCurrentUser
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted"
                      }`}
                    >
                      {msg.body}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <Textarea
          placeholder="Message your planner…"
          className="min-h-0 resize-none rounded-xl"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          size="icon"
          className="shrink-0 self-end rounded-xl"
          onClick={handleSend}
          disabled={!body.trim() || sending}
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
