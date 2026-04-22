"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";

type WeddingChatWidgetProps = {
  weddingId: string;
};

function ChatPanel({ weddingId }: WeddingChatWidgetProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    import("deep-chat").then(() => {
      const el = ref.current;
      if (!el) return;
      (el as any).connect = {
        url: `/api/weddings/${weddingId}/chat`,
        method: "POST",
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
    });
  }, [weddingId]);

  return (
    // @ts-expect-error deep-chat is a web component
    <deep-chat ref={ref} style={{ height: "471px", width: "380px", display: "block" }} />
  );
}

export function WeddingChatWidget({ weddingId }: WeddingChatWidgetProps) {
  const [open, setOpen] = useState(false);

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
            <ChatPanel weddingId={weddingId} />
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
