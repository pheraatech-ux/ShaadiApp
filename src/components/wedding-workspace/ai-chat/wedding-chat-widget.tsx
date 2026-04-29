"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, X } from "lucide-react";

import { vendorsQueryKey } from "@/components/wedding-workspace/vendors/use-vendors-query";

type WeddingChatWidgetProps = {
  weddingSlug: string;
};

type ChatPanelProps = {
  weddingSlug: string;
  sessionId: string | null;
};

function ChatPanel({ weddingSlug, sessionId }: ChatPanelProps) {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await import("deep-chat");
      if (cancelled) return;

      const el = ref.current;
      if (!el) return;

      (el as any).connect = {
        url: `/api/weddings/${weddingSlug}/chat`,
        method: "POST",
        ...(sessionId ? { additionalBodyProps: { sessionId } } : {}),
      };

      (el as any).responseInterceptor = (response: { text?: string; actionsPerformed?: string[] }) => {
        const actions = response?.actionsPerformed ?? [];
        if (actions.includes("vendors")) {
          queryClient.invalidateQueries({ queryKey: vendorsQueryKey(weddingSlug) });
        }
        return response;
      };

      (el as any).introMessage = {
        text: "Hi! Ask me anything about this wedding — missing vendors, traditions, tasks, budget, or cultural rituals. I'm here to help!",
      };
      (el as any).messageStyles = {
        default: {
          ai: { bubble: { backgroundColor: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" } },
          user: { bubble: { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" } },
        },
      };
      (el as any).inputAreaStyle = { backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" };
      (el as any).chatStyle = {
        backgroundColor: "var(--background)",
        borderRadius: "0",
        border: "none",
        height: "471px",
        width: "380px",
      };
      (el as any).textInput = {
        placeholder: { text: "Ask about this wedding…" },
        styles: {
          container: { backgroundColor: "var(--muted)", borderRadius: "0.5rem", border: "1px solid var(--border)" },
          text: { color: "var(--foreground)" },
        },
      };

      if (!cancelled) setReady(true);
    }

    init();
    return () => { cancelled = true; };
  }, [weddingSlug, sessionId, queryClient]);

  return (
    <div style={{ height: "471px", width: "380px", position: "relative" }}>
      {!ready && (
        <div
          style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          className="text-sm text-muted-foreground"
        >
          Connecting…
        </div>
      )}
      {/* @ts-expect-error deep-chat is a web component */}
      <deep-chat ref={ref} style={{ height: "471px", width: "380px", display: "block" }} />
    </div>
  );
}

export function WeddingChatWidget({ weddingSlug }: WeddingChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionInitiated = useRef(false);

  // Create session once on mount — persists across open/close so a single
  // conversation thread is maintained for the entire page visit.
  useEffect(() => {
    if (sessionInitiated.current) return;
    sessionInitiated.current = true;

    fetch(`/api/weddings/${weddingSlug}/chat/session`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { sessionId: string } | null) => {
        if (data?.sessionId) setSessionId(data.sessionId);
      })
      .catch(() => {});
  }, [weddingSlug]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          style={{ width: 380, height: 520 }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-violet-500" />
              <p className="text-sm font-semibold text-foreground">Wedding AI</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-hidden" style={{ height: 471 }}>
            <ChatPanel weddingSlug={weddingSlug} sessionId={sessionId} />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle wedding AI chat"
        className="flex size-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-all hover:bg-violet-700 active:scale-95"
      >
        {open ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>
    </div>
  );
}
