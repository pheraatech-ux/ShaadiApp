"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessagesComposerProps = {
  weddingSlug: string;
  threadId: string | null;
};

export function MessagesComposer({ weddingSlug, threadId }: MessagesComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = value.trim();
    if (!body) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/records`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "message",
          primary: body,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send message.");
      }

      setValue("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type your message..."
        className="min-h-20 resize-y"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {threadId ? "Press send to post this in the selected thread." : "Select a thread before sending a message."}
        </p>
        <Button type="submit" size="lg" disabled={!threadId || !value.trim() || submitting}>
          <SendHorizontal className="size-4" />
          {submitting ? "Sending..." : "Send"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
