"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, MessageSquare, Plus, X } from "lucide-react";

import { vendorsQueryKey } from "@/components/wedding-workspace/vendors/use-vendors-query";

type Session = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

type HistoryMessage = { role: string; text: string };

type ChatPanelProps = {
  weddingSlug: string;
  sessionId: string;
  onFirstMessageSent: () => void;
};

function ChatPanel({ weddingSlug, sessionId, onFirstMessageSent }: ChatPanelProps) {
  const ref = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const queryClient = useQueryClient();

  // Stable ref so the responseInterceptor closure doesn't go stale
  const onFirstMessageSentRef = useRef(onFirstMessageSent);
  onFirstMessageSentRef.current = onFirstMessageSent;

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    // Track whether the very first AI reply has come back yet so we know
    // when to refresh the session list (title gets set server-side after turn 1).
    let isFirstReply = true;

    async function init() {
      const [, historyData] = await Promise.all([
        import("deep-chat"),
        fetch(`/api/weddings/${weddingSlug}/chat/session/${sessionId}/messages`)
          .then((r) => (r.ok ? (r.json() as Promise<{ messages: HistoryMessage[] }>) : { messages: [] }))
          .catch(() => ({ messages: [] as HistoryMessage[] })),
      ]);

      if (cancelled) return;

      const el = ref.current;
      if (!el) return;

      const history = historyData.messages;
      isFirstReply = history.length === 0;

      if (history.length > 0) {
        (el as any).history = history;
      } else {
        (el as any).introMessage = {
          text: "Hi! Ask me anything about this wedding — missing vendors, traditions, tasks, budget, or cultural rituals. I'm here to help!",
        };
      }

      (el as any).connect = {
        url: `/api/weddings/${weddingSlug}/chat`,
        method: "POST",
        additionalBodyProps: { sessionId },
      };

      (el as any).responseInterceptor = (response: { text?: string; actionsPerformed?: string[] }) => {
        const actions = response?.actionsPerformed ?? [];
        if (actions.includes("vendors")) {
          queryClient.invalidateQueries({ queryKey: vendorsQueryKey(weddingSlug) });
        }
        if (isFirstReply) {
          isFirstReply = false;
          onFirstMessageSentRef.current();
        }
        return response;
      };

      (el as any).messageStyles = {
        default: {
          ai: {
            bubble: {
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          },
          user: {
            bubble: {
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            },
          },
        },
      };
      (el as any).inputAreaStyle = {
        backgroundColor: "var(--background)",
        borderTop: "1px solid var(--border)",
      };
      (el as any).chatStyle = {
        backgroundColor: "var(--background)",
        borderRadius: "0",
        border: "none",
        height: "100%",
        width: "100%",
      };
      (el as any).textInput = {
        placeholder: { text: "Ask about this wedding…" },
        styles: {
          container: {
            backgroundColor: "var(--muted)",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
          },
          text: { color: "var(--foreground)" },
        },
      };

      if (!cancelled) setStatus("ready");
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [weddingSlug, sessionId, queryClient]);

  return (
    <div className="relative h-full w-full">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background text-sm text-muted-foreground">
          Loading…
        </div>
      )}
      {/* @ts-expect-error deep-chat is a web component */}
      <deep-chat
        ref={ref}
        style={{ height: "100%", width: "100%", display: status === "loading" ? "none" : "block" }}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WeddingChatWidget({ weddingSlug }: { weddingSlug: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const fetchSessions = useCallback(async (): Promise<{
    activeSession: Session | null;
    sessions: Session[];
  } | null> => {
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/chat/session`);
      if (!res.ok) return null;
      return res.json() as Promise<{ activeSession: Session | null; sessions: Session[] }>;
    } catch {
      return null;
    }
  }, [weddingSlug]);

  const refreshSessions = useCallback(async () => {
    const data = await fetchSessions();
    if (data) setSessions(data.sessions);
  }, [fetchSessions]);

  // On mount: load existing sessions. If none exist, create the first one.
  useEffect(() => {
    (async () => {
      const data = await fetchSessions();
      if (data && data.sessions.length > 0) {
        setSessions(data.sessions);
        setActiveSessionId(data.activeSession?.id ?? data.sessions[0].id);
        setInitializing(false);
        return;
      }

      // No sessions yet — create the first one so the panel is immediately ready.
      try {
        const res = await fetch(`/api/weddings/${weddingSlug}/chat/session`, { method: "POST" });
        if (res.ok) {
          const { sessionId } = (await res.json()) as { sessionId: string };
          const newSession: Session = {
            id: sessionId,
            title: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setSessions([newSession]);
          setActiveSessionId(sessionId);
        }
      } catch {}

      setInitializing(false);
    })();
  }, [weddingSlug, fetchSessions]);

  const handleNewChat = async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/chat/session`, { method: "POST" });
      if (!res.ok) return;
      const { sessionId } = (await res.json()) as { sessionId: string };
      const newSession: Session = {
        id: sessionId,
        title: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(sessionId);
      setView("chat");
    } catch {}
  };

  const handleSessionSelect = (id: string) => {
    setActiveSessionId(id);
    setView("chat");
  };

  // Called after the AI responds to the first message — fetches updated session
  // list so the newly-set title appears in the history sidebar.
  const handleFirstMessageSent = useCallback(() => {
    refreshSessions();
  }, [refreshSessions]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          style={{ width: 380, height: 520 }}
        >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card px-4 py-3">
            {view === "history" ? (
              <>
                <button
                  onClick={() => setView("chat")}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Back to chat"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <p className="text-sm font-semibold text-foreground">Previous Chats</p>
                <div className="size-6" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("history")}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="View chat history"
                    title="Chat history"
                  >
                    <Clock className="size-4" />
                  </button>
                  <MessageSquare className="size-4 text-violet-500" />
                  <p className="text-sm font-semibold text-foreground">Wedding AI</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="New chat"
                    title="Start a new conversation"
                  >
                    <Plus className="size-3.5" />
                    New
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close chat"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Body ── */}
          {view === "history" ? (
            <div className="flex flex-col overflow-y-auto">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 border-b border-border/40 px-4 py-3 text-sm font-medium text-violet-600 transition-colors hover:bg-muted"
              >
                <Plus className="size-4" />
                New Chat
              </button>

              {sessions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No previous chats.</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className={`flex flex-col items-start border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-muted ${
                      session.id === activeSessionId ? "bg-muted/60" : ""
                    }`}
                  >
                    <p className="w-full truncate text-sm font-medium text-foreground">
                      {session.title ?? "New conversation"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(session.updated_at)}</p>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              {initializing || !activeSessionId ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Connecting…
                </div>
              ) : (
                <ChatPanel
                  key={activeSessionId}
                  weddingSlug={weddingSlug}
                  sessionId={activeSessionId}
                  onFirstMessageSent={handleFirstMessageSent}
                />
              )}
            </div>
          )}
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
