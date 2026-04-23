"use client";

import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

type MessagesComposerProps = {
  threadId: string | null;
  onSend: (body: string) => Promise<void>;
};

export function MessagesComposer({ threadId, onSend }: MessagesComposerProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  async function handleSend() {
    const body = value.trim();
    if (!body || !threadId || submitting) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
      className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autoResize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={threadId ? "Type a message…" : "Select a thread to send a message."}
        disabled={!threadId}
        className="flex-1 resize-none overflow-hidden bg-transparent text-sm leading-5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        style={{ maxHeight: "8rem" }}
      />
      <Button
        type="submit"
        size="sm"
        disabled={!threadId || !value.trim() || submitting}
        className="shrink-0"
      >
        <SendHorizontal className="size-4" />
        {submitting ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
