"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";

import type { WeddingMessageParticipant } from "@/components/wedding-workspace/messages/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NewThreadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: WeddingMessageParticipant[];
  onCreateThread: (payload: { title: string; participantIds: string[] }) => Promise<void>;
};

export function NewThreadDialog({ open, onOpenChange, participants, onCreateThread }: NewThreadDialogProps) {
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredParticipants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return participants;
    return participants.filter((participant) => participant.label.toLowerCase().includes(normalized));
  }, [participants, query]);

  function resetState() {
    setQuery("");
    setTitle("");
    setSelectedParticipantIds([]);
    setCreating(false);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  }

  function toggleParticipant(participantId: string) {
    setSelectedParticipantIds((current) =>
      current.includes(participantId) ? current.filter((id) => id !== participantId) : [...current, participantId],
    );
  }

  function buildDefaultTitle() {
    if (selectedParticipantIds.length === 1) {
      const selected = participants.find((item) => item.id === selectedParticipantIds[0]);
      return selected?.label ?? "Direct chat";
    }
    return `Group chat (${selectedParticipantIds.length})`;
  }

  async function handleCreateThread() {
    if (!selectedParticipantIds.length) return;
    setCreating(true);
    setError(null);
    try {
      await onCreateThread({
        title: title.trim() || buildDefaultTitle(),
        participantIds: selectedParticipantIds,
      });
      handleOpenChange(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create thread.");
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-[520px]"
      >
        <DialogHeader className="relative space-y-1 border-b px-6 pt-5 pb-4">
          <DialogClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-4 rounded-full" />}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="pr-10">Start new chat thread</DialogTitle>
          <DialogDescription>
            Select one team member for a direct chat or multiple members for a group conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="thread-title">
              Thread title (optional)
            </label>
            <Input
              id="thread-title"
              className="h-11 rounded-xl bg-muted/40"
              placeholder="Ex: Mehendi logistics"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground" htmlFor="thread-search">
              Team members
            </label>
            <Input
              id="thread-search"
              className="h-11 rounded-xl bg-muted/40"
              placeholder="Search member..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filteredParticipants.map((participant) => {
              const selected = selectedParticipantIds.includes(participant.id);
              return (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => toggleParticipant(participant.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors",
                    selected
                      ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                      : "border-border/80 bg-muted/20 hover:bg-muted/40",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{participant.isCurrentUser ? `${participant.label} (you)` : participant.label}</p>
                    <p className="text-xs text-muted-foreground">{participant.status}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded-full border",
                      selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:gap-3">
          <Button
            type="button"
            className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            disabled={!selectedParticipantIds.length || creating}
            onClick={handleCreateThread}
          >
            {creating ? "Creating..." : "Create thread"}
          </Button>
          <Button type="button" variant="outline" className="flex-1 rounded-xl" disabled={creating} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </div>
        {error ? <p className="px-6 pb-4 text-xs text-destructive">{error}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
