"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, StickyNote as StickyNoteIcon, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import type { NoteColor, NoteVisibility, StickyNote, StickyNotesBoardViewModel } from "@/components/app-dashboard/notes/types";
import { NOTE_COLOR_CLASSES, NOTE_COLORS } from "@/components/app-dashboard/notes/types";
import { StickyNoteCard } from "@/components/app-dashboard/notes/sticky-note-card";
import { useStickyNotesQuery, useInvalidateNotes } from "@/components/app-dashboard/notes/use-sticky-notes-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const COLOR_CYCLE: NoteColor[] = ["yellow", "pink", "blue", "green", "purple"];

type Tab = "public" | "private";

type StickyNotesBoardProps = {
  view: StickyNotesBoardViewModel;
};

export function StickyNotesBoard({ view }: StickyNotesBoardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("public");
  const [optimisticNotes, setOptimisticNotes] = useState<{ public: StickyNote[]; private: StickyNote[] }>({
    public: [],
    private: [],
  });
  const [nextColor, setNextColor] = useState<NoteColor>("yellow");

  const { data: publicNotes } = useStickyNotesQuery("public", view.publicNotes);
  const { data: privateNotes } = useStickyNotesQuery("private", view.privateNotes);
  const invalidate = useInvalidateNotes();

  // Realtime: invalidate when any team member posts a public note
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("sticky-notes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sticky_notes" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { author_user_id?: string; visibility?: string } | undefined;
          if (!row) return;
          const vis = row.visibility as NoteVisibility | undefined;
          if (vis === "public") {
            if (row.author_user_id !== view.currentUserId) invalidate("public");
          } else if (vis === "private" && row.author_user_id === view.currentUserId) {
            invalidate("private");
          }
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [view.currentUserId, invalidate]);

  // Merge server + optimistic, dedup by id
  const mergedNotes = useMemo(() => {
    const serverById = new Map((activeTab === "public" ? publicNotes : privateNotes).map((n) => [n.id, n]));
    for (const n of optimisticNotes[activeTab]) {
      if (!serverById.has(n.id)) serverById.set(n.id, n);
    }
    const all = [...serverById.values()];
    return all.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeTab, publicNotes, privateNotes, optimisticNotes]);

  async function handleAddNote() {
    const tempId = crypto.randomUUID();
    const color = nextColor;
    setNextColor((prev) => {
      const idx = COLOR_CYCLE.indexOf(prev);
      return COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
    });

    const optimistic: StickyNote = {
      id: tempId,
      ownerUserId: "",
      authorUserId: view.currentUserId,
      authorLabel: view.currentUserLabel,
      content: "",
      color,
      visibility: activeTab,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentUser: true,
    };

    setOptimisticNotes((prev) => ({ ...prev, [activeTab]: [optimistic, ...prev[activeTab]] }));

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", color, visibility: activeTab }),
      });
      if (!res.ok) throw new Error("Create failed");
      const { note } = (await res.json()) as { note: StickyNote };
      // Replace temp with real
      setOptimisticNotes((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((n) => (n.id === tempId ? note : n)),
      }));
      invalidate(activeTab);
    } catch {
      setOptimisticNotes((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((n) => n.id !== tempId),
      }));
      toast.error("Failed to create note.");
    }
  }

  async function handleUpdate(id: string, patch: { content?: string; color?: NoteColor; pinned?: boolean }) {
    const tab = activeTab;
    // Optimistic update across both server+optimistic sets
    const applyPatch = (notes: StickyNote[]) =>
      notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n));

    setOptimisticNotes((prev) => ({ ...prev, [tab]: applyPatch(prev[tab]) }));

    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setOptimisticNotes((prev) => prev);
      throw new Error("Update failed");
    }
    invalidate(tab);
  }

  async function handleDelete(id: string) {
    const tab = activeTab;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error("Delete failed");
    setOptimisticNotes((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((n) => n.id !== id),
    }));
    invalidate(tab);
  }

  const tabs: { key: Tab; label: string; Icon: React.ElementType; description: string }[] = [
    { key: "public",  label: "Team Board",  Icon: Globe, description: "Visible to everyone in your company" },
    { key: "private", label: "My Notes",    Icon: Lock,  description: "Only visible to you" },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => void handleAddNote()}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all",
            "border-border/70 bg-card text-foreground shadow-sm hover:shadow-md hover:border-border",
            "active:scale-95",
          )}
        >
          <Plus className="size-3.5" />
          New note
        </button>
      </div>

      {/* Sub-description */}
      <p className="text-xs text-muted-foreground -mt-4">
        {tabs.find((t) => t.key === activeTab)?.description}
      </p>

      {/* Board grid */}
      {mergedNotes.length === 0 ? (
        <EmptyState tab={activeTab} onAdd={() => void handleAddNote()} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {mergedNotes.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ tab, onAdd }: { tab: Tab; onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-16">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
        <StickyNoteIcon className="size-7 text-muted-foreground/60" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground/70">
          {tab === "public" ? "No team notes yet" : "No personal notes yet"}
        </p>
        <p className="text-xs text-muted-foreground">
          {tab === "public"
            ? "Drop a note for the whole team to see"
            : "Jot down personal reminders, only visible to you"}
        </p>
      </div>
      <button
        onClick={onAdd}
        className={cn(
          "flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-4 py-2 text-sm font-medium",
          "text-foreground shadow-sm transition-all hover:shadow-md active:scale-95",
        )}
      >
        <Plus className="size-3.5" />
        Drop your first note
      </button>
    </div>
  );
}
