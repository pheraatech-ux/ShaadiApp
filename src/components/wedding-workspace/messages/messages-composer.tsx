"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessagesComposerProps = {
  threadId: string | null;
  onSend: (body: string) => Promise<void>;
};

export function MessagesComposer({ threadId, onSend }: MessagesComposerProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    const body = value.trim();
    if (!body || !threadId || submitting) return;
    setValue("");
    setSubmitting(true);
    try {
      await onSend(body);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="space-y-2 rounded-xl border border-border/70 bg-card p-3"
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type your message…"
        className="min-h-20 resize-y"
        disabled={!threadId}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {threadId ? "Enter ↵ to send · Shift+Enter for new line" : "Select a thread before sending a message."}
        </p>
        <Button type="submit" size="lg" disabled={!threadId || !value.trim() || submitting}>
          <SendHorizontal className="size-4" />
          {submitting ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
