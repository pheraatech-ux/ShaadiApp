"use client";

import { useEffect, useState } from "react";
import { Plus, StickyNote as StickyNoteIcon, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import type { NoteColor, NoteVisibility, StickyNote, StickyNotesBoardViewModel } from "@/components/app-dashboard/notes/types";
import { StickyNoteCard } from "@/components/app-dashboard/notes/sticky-note-card";
import { useStickyNotesQuery, useNotesCache } from "@/components/app-dashboard/notes/use-sticky-notes-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const COLOR_CYCLE: NoteColor[] = ["yellow", "pink", "blue", "green", "purple"];

type Tab = "public" | "private";

type RealtimeRow = {
  id?: string;
  author_user_id?: string;
  owner_user_id?: string;
  content?: string;
  color?: string;
  visibility?: string;
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function StickyNotesBoard({ view }: { view: StickyNotesBoardViewModel }) {
  const [activeTab, setActiveTab] = useState<Tab>("public");
  const [nextColor, setNextColor] = useState<NoteColor>("yellow");

  const { data: publicNotes } = useStickyNotesQuery("public", view.publicNotes);
  const { data: privateNotes } = useStickyNotesQuery("private", view.privateNotes);
  const cache = useNotesCache();

  const notes = activeTab === "public" ? publicNotes : privateNotes;
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Realtime: directly push/patch/remove from cache so changes are instant.
  // No invalidation on the hot path — let the background refetch reconcile.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("sticky-notes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sticky_notes" },
        (payload) => {
          const isInsert = payload.eventType === "INSERT";
          const isUpdate = payload.eventType === "UPDATE";
          const isDelete = payload.eventType === "DELETE";

          if (isInsert || isUpdate) {
            const row = payload.new as RealtimeRow;
            if (!row.id) return;
            // Skip our own writes — we already applied optimistic updates
            if (row.author_user_id === view.currentUserId) return;

            const vis = row.visibility as NoteVisibility | undefined;
            if (vis !== "public" && vis !== "private") return;

            const note: StickyNote = {
              id: row.id,
              ownerUserId: row.owner_user_id ?? "",
              authorUserId: row.author_user_id ?? "",
              authorLabel: "Team Member",
              content: row.content ?? "",
              color: (row.color ?? "yellow") as NoteColor,
              visibility: vis,
              pinned: row.pinned ?? false,
              createdAt: row.created_at ?? new Date().toISOString(),
              updatedAt: row.updated_at ?? new Date().toISOString(),
              isCurrentUser: false,
            };

            if (isInsert) {
              cache.pushNote(note);
            } else {
              cache.patchNote(row.id, note);
            }

            // Background refetch to fill in real author label
            cache.invalidate(vis);
          }

          if (isDelete) {
            const row = payload.old as RealtimeRow;
            if (row.id) cache.removeNote(row.id);
          }
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.currentUserId]);

  async function handleAddNote() {
    const tempId = `temp-${crypto.randomUUID()}`;
    const color = nextColor;
    setNextColor((prev) => {
      const idx = COLOR_CYCLE.indexOf(prev);
      return COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
    });

    // Instant — appears in the grid immediately
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
    cache.pushNote(optimistic);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "", color, visibility: activeTab }),
      });
      if (!res.ok) throw new Error("Create failed");
      const { note } = (await res.json()) as { note: StickyNote };
      cache.confirmNote(tempId, { ...note, authorLabel: view.currentUserLabel, isCurrentUser: true });
    } catch {
      cache.removeNote(tempId);
      toast.error("Failed to create note.");
    }
  }

  async function handleUpdate(id: string, patch: { content?: string; color?: NoteColor; pinned?: boolean }) {
    // Snapshot for rollback
    const snap = {
      public: cache.getSnapshot("public"),
      private: cache.getSnapshot("private"),
    };

    // Instant patch
    cache.patchNote(id, { ...patch, updatedAt: new Date().toISOString() });

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // Rollback
      cache.setNotes("public", () => snap.public);
      cache.setNotes("private", () => snap.private);
      throw new Error("Update failed");
    }
  }

  async function handleDelete(id: string) {
    const snap = {
      public: cache.getSnapshot("public"),
      private: cache.getSnapshot("private"),
    };

    // Instant removal
    cache.removeNote(id);

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      cache.setNotes("public", () => snap.public);
      cache.setNotes("private", () => snap.private);
      toast.error("Failed to delete note.");
    }
  }

  const tabs: { key: Tab; label: string; Icon: React.ElementType; description: string }[] = [
    { key: "public",  label: "Team Board", Icon: Globe, description: "Visible to everyone in your company" },
    { key: "private", label: "My Notes",   Icon: Lock,  description: "Only visible to you" },
  ];

  return (
    <div className="flex h-full flex-col gap-6">
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

      <p className="text-xs text-muted-foreground -mt-4">
        {tabs.find((t) => t.key === activeTab)?.description}
      </p>

      {sorted.length === 0 ? (
        <EmptyState tab={activeTab} onAdd={() => void handleAddNote()} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {sorted.map((note) => (
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
