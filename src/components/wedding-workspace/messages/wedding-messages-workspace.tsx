"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { MessagesComposer } from "@/components/wedding-workspace/messages/messages-composer";
import { MessagesConversationList } from "@/components/wedding-workspace/messages/messages-conversation-list";
import { MessagesThread } from "@/components/wedding-workspace/messages/messages-thread";
import { NewThreadDialog } from "@/components/wedding-workspace/messages/new-thread-dialog";
import type { WeddingMessageItem, WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type WeddingMessagesWorkspaceProps = {
  view: WeddingMessagesWorkspaceViewModel;
  initialThreadId?: string;
};

function formatLastActivity(value: string | null) {
  if (!value) return "No activity yet";
  return `Last update ${new Date(value).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WeddingMessagesWorkspace({ view, initialThreadId }: WeddingMessagesWorkspaceProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreadId ?? view.defaultThreadId,
  );
  const [threadDialogOpen, setThreadDialogOpen] = useState(false);
  const [optimisticThreads, setOptimisticThreads] = useState<WeddingMessagesWorkspaceViewModel["threads"]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<WeddingMessageItem[]>([]);

  // Supabase Realtime: listen for new messages from other users
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
            router.refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [view.weddingId, view.currentUserId, router]);

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

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allThreads;
    return allThreads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.participantLabels.some((participantLabel) => participantLabel.toLowerCase().includes(query)),
    );
  }, [allThreads, search]);

  // Deduplicate: once real messages arrive from view, drop matching optimistic ones
  const realMessageIds = useMemo(() => new Set(view.messages.map((m) => m.id)), [view.messages]);

  const allMessages = useMemo(() => {
    const pending = optimisticMessages.filter((m) => !realMessageIds.has(m.id));
    return [...view.messages, ...pending].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [view.messages, optimisticMessages, realMessageIds]);

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
        // Replace temp ID with real ID so dedup works on next refresh
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: realId, isPending: false } : m)),
        );
      }

      router.refresh();
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Message failed to send. Please try again.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Messages - {view.coupleName}</CardTitle>
            <Button size="sm" className="rounded-xl" onClick={() => setThreadDialogOpen(true)}>
              <Plus className="size-4" />
              New thread
            </Button>
          </div>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{view.summary.totalMessages} messages</Badge>
            <Badge variant="outline">{view.summary.threadCount} threads</Badge>
            <Badge variant="outline">{view.summary.participantCount} participants</Badge>
            <span>{formatLastActivity(view.summary.lastMessageAt)}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[320px_1fr]">
        <Card className="flex min-h-0 flex-col border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-hidden">
            <MessagesConversationList
              threads={filteredThreads}
              search={search}
              onSearchChange={setSearch}
              selectedThreadId={activeThreadId}
              onSelectThreadId={setSelectedThreadId}
            />
          </CardContent>
        </Card>

        <div className="flex min-h-0 flex-col gap-4">
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
          router.refresh();
        }}
      />
    </div>
  );
}
