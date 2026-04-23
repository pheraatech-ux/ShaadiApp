"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { MessagesComposer } from "@/components/wedding-workspace/messages/messages-composer";
import { MessagesConversationList } from "@/components/wedding-workspace/messages/messages-conversation-list";
import { MessagesThread } from "@/components/wedding-workspace/messages/messages-thread";
import { MessagesThreadHeader } from "@/components/wedding-workspace/messages/messages-thread-header";
import { NewThreadDialog } from "@/components/wedding-workspace/messages/new-thread-dialog";
import type { WeddingMessageItem, WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { useMessagesQuery, useInvalidateMessages } from "@/components/wedding-workspace/messages/use-messages-query";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type WeddingMessagesWorkspaceProps = {
  view: WeddingMessagesWorkspaceViewModel;
  initialThreadId?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WeddingMessagesWorkspace({ view, initialThreadId }: WeddingMessagesWorkspaceProps) {
  const { data: serverMessages } = useMessagesQuery(view.weddingSlug, view.messages);
  const invalidateMessages = useInvalidateMessages(view.weddingSlug);

  const [search, setSearch] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreadId ?? view.defaultThreadId,
  );
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [optimisticThreads, setOptimisticThreads] = useState<WeddingMessagesWorkspaceViewModel["threads"]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<WeddingMessageItem[]>([]);

  // Supabase Realtime: when another user sends a message, invalidate the TanStack Query cache
  // — same pattern as tasks kanban, instant update without a full page refresh
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`wedding-messages:${view.weddingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `wedding_id=eq.${view.weddingId}`,
        },
        (payload) => {
          const raw = payload.new as { author_user_id?: string };
          if (raw.author_user_id !== view.currentUserId) {
            void invalidateMessages();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [view.weddingId, view.currentUserId, invalidateMessages]);

  const allThreads = useMemo(() => {
    const byId = new Map(view.threads.map((thread) => [thread.id, thread]));
    for (const thread of optimisticThreads) {
      byId.set(thread.id, thread);
    }
    return [...byId.values()];
  }, [optimisticThreads, view.threads]);

  const threadById = useMemo(() => new Map(allThreads.map((thread) => [thread.id, thread])), [allThreads]);
  const activeThreadId =
    selectedThreadId && threadById.has(selectedThreadId) ? selectedThreadId : view.defaultThreadId ?? allThreads[0]?.id ?? null;

  // Deduplicate: once TanStack Query refetches and the real message arrives, drop the matching optimistic entry
  const realMessageIds = useMemo(() => new Set(serverMessages.map((m) => m.id)), [serverMessages]);

  const allMessages = useMemo(() => {
    const pending = optimisticMessages.filter((m) => !realMessageIds.has(m.id));
    return [...serverMessages, ...pending].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [serverMessages, optimisticMessages, realMessageIds]);

  // Derive the latest message timestamp per thread from live messages so the list
  // re-sorts in real time (WhatsApp-style bubble-to-top) without waiting for a page refresh
  const threadLastActivity = useMemo(() => {
    const map = new Map<string, string>();
    for (const msg of allMessages) {
      map.set(msg.threadId, msg.createdAt);
    }
    return map;
  }, [allMessages]);

  const sortedThreads = useMemo(
    () =>
      [...allThreads].sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        const aTime = threadLastActivity.get(a.id) ?? a.lastMessageAt;
        const bTime = threadLastActivity.get(b.id) ?? b.lastMessageAt;
        return (bTime ? new Date(bTime).getTime() : 0) - (aTime ? new Date(aTime).getTime() : 0);
      }),
    [allThreads, threadLastActivity],
  );

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedThreads;
    return sortedThreads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.participantLabels.some((participantLabel) => participantLabel.toLowerCase().includes(query)),
    );
  }, [sortedThreads, search]);

  const filteredMessages = useMemo(
    () => (activeThreadId ? allMessages.filter((message) => message.threadId === activeThreadId) : []),
    [activeThreadId, allMessages],
  );

  async function sendMessage(body: string) {
    if (!activeThreadId) return;

    const tempId = crypto.randomUUID();
    const optimistic: WeddingMessageItem = {
      id: tempId,
      threadId: activeThreadId,
      body,
      createdAt: new Date().toISOString(),
      authorUserId: view.currentUserId,
      authorLabel: view.currentUserLabel,
      authorInitials: getInitials(view.currentUserLabel),
      isCurrentUser: true,
      isPending: true,
    };

    setOptimisticMessages((prev) => [...prev, optimistic]);

    try {
      const response = await fetch(`/api/weddings/${view.weddingSlug}/records`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "message", primary: body, threadId: activeThreadId }),
      });

      if (!response.ok) throw new Error("Unable to send message.");

      const data = (await response.json()) as { message?: { id: string } };
      const realId = data.message?.id;

      if (realId) {
        // Replace temp ID with real ID so dedup works when TanStack Query refetches
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: realId, isPending: false } : m)),
        );
      }

      void invalidateMessages();
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Message failed to send. Please try again.");
    }
  }

  const activeThread = activeThreadId ? threadById.get(activeThreadId) ?? null : null;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: conversation list */}
      <div className="flex w-[360px] shrink-0 flex-col overflow-hidden border-r border-border/70 bg-card">
        <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-border/70 px-4">
          <span className="text-sm font-semibold">Messages</span>
          <Button size="sm" variant="outline" className="h-7 rounded-lg px-2 text-xs" onClick={() => setThreadDialogOpen(true)}>
            <Plus className="size-3" />
            New
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-3">
          <MessagesConversationList
            threads={filteredThreads}
            search={search}
            onSearchChange={setSearch}
            selectedThreadId={activeThreadId}
            onSelectThreadId={setSelectedThreadId}
          />
        </div>
      </div>

      {/* Right: active thread */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {activeThread && (
          <div className="flex h-[58px] shrink-0 items-center border-b border-border/70 bg-card px-4">
            <MessagesThreadHeader thread={activeThread} currentUserId={view.currentUserId} />
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <MessagesThread messages={filteredMessages} />
          <MessagesComposer threadId={activeThreadId} onSend={sendMessage} />
        </div>
      </div>

      <NewThreadDialog
        open={threadDialogOpen}
        onOpenChange={setThreadDialogOpen}
        participants={view.participants}
        onCreateThread={async ({ title, participantIds }) => {
          const response = await fetch(`/api/weddings/${view.weddingSlug}/messages/threads`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, participantIds }),
          });
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            thread?: {
              id: string;
              title: string;
              isDefault: boolean;
              participantIds: string[];
              messageCount: number;
              lastMessageAt: string | null;
            };
          };
          if (!response.ok || !payload.thread) {
            throw new Error(payload.error || "Unable to create thread.");
          }

          const participantLabels = payload.thread.participantIds
            .map((participantId) => view.participants.find((participant) => participant.id === participantId)?.label)
            .filter(Boolean) as string[];
          const nextThread = {
            id: payload.thread.id,
            title: payload.thread.title,
            isDefault: payload.thread.isDefault,
            participantIds: payload.thread.participantIds,
            participantLabels,
            messageCount: payload.thread.messageCount,
            lastMessageAt: payload.thread.lastMessageAt,
          };
          setOptimisticThreads((current) => [nextThread, ...current.filter((thread) => thread.id !== nextThread.id)]);
          setSelectedThreadId(nextThread.id);
          void invalidateMessages();
        }}
      />
    </div>
  );
}
