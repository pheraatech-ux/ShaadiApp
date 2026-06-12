"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  clampNotePosition,
  layoutToPct,
  pctToPixels,
  resolveNoteLayout,
} from "@/components/app-dashboard/notes/canvas-utils";
import type { NoteLayoutPixels } from "@/components/app-dashboard/notes/canvas-utils";
import type { NoteColor, NoteVisibility, StickyNote, StickyNotesBoardViewModel } from "@/components/app-dashboard/notes/types";
import {
  DEFAULT_NOTE_HEIGHT_PCT,
  DEFAULT_NOTE_WIDTH_PCT,
} from "@/components/app-dashboard/notes/types";
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
  pos_x?: number | null;
  pos_y?: number | null;
  width_pct?: number | null;
  height_pct?: number | null;
  created_at?: string;
  updated_at?: string;
};

type LayoutPatch = {
  posX?: number;
  posY?: number;
  widthPct?: number;
  heightPct?: number;
};

export function StickyNotesBoard({ view }: { view: StickyNotesBoardViewModel }) {
  const [activeTab, setActiveTab] = useState<Tab>("public");
  const [nextColor, setNextColor] = useState<NoteColor>("yellow");
  const [focusNoteId, setFocusNoteId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: publicNotes } = useStickyNotesQuery("public", view.publicNotes);
  const { data: privateNotes } = useStickyNotesQuery("private", view.privateNotes);
  const cache = useNotesCache();

  const notes = activeTab === "public" ? publicNotes : privateNotes;
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? 1 : -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const update = () => {
      const rect = canvas.getBoundingClientRect();
      setCanvasSize({ w: rect.width, h: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

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
              posX: row.pos_x ?? null,
              posY: row.pos_y ?? null,
              widthPct: row.width_pct ?? null,
              heightPct: row.height_pct ?? null,
              createdAt: row.created_at ?? new Date().toISOString(),
              updatedAt: row.updated_at ?? new Date().toISOString(),
              isCurrentUser: false,
            };

            if (isInsert) cache.pushNote(note);
            else cache.patchNote(row.id, note);

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

  async function persistLayout(id: string, patch: LayoutPatch) {
    const snap = {
      public: cache.getSnapshot("public"),
      private: cache.getSnapshot("private"),
    };

    cache.patchNote(id, patch);

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Layout update failed");
    } catch {
      cache.setNotes("public", () => snap.public);
      cache.setNotes("private", () => snap.private);
      toast.error("Failed to save note position.");
    }
  }

  async function handleAddNote(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;

    const rect = canvas.getBoundingClientRect();
    const noteW = pctToPixels(null, canvasSize.w, DEFAULT_NOTE_WIDTH_PCT);
    const noteH = pctToPixels(null, canvasSize.h, DEFAULT_NOTE_HEIGHT_PCT);
    const rawX = clientX - rect.left - noteW / 2;
    const rawY = clientY - rect.top - 24;
    const { x, y } = clampNotePosition(rawX, rawY, noteW, noteH, canvasSize.w, canvasSize.h);
    const pct = layoutToPct({ x, y, w: noteW, h: noteH }, canvasSize.w, canvasSize.h);

    const tempId = `temp-${crypto.randomUUID()}`;
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
      posX: pct.posX,
      posY: pct.posY,
      widthPct: pct.widthPct,
      heightPct: pct.heightPct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentUser: true,
    };

    cache.pushNote(optimistic);
    setFocusNoteId(tempId);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "",
          color,
          visibility: activeTab,
          posX: pct.posX,
          posY: pct.posY,
          widthPct: pct.widthPct,
          heightPct: pct.heightPct,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const { note } = (await res.json()) as { note: StickyNote };
      cache.confirmNote(tempId, {
        ...note,
        authorLabel: view.currentUserLabel,
        isCurrentUser: true,
        posX: pct.posX,
        posY: pct.posY,
        widthPct: pct.widthPct,
        heightPct: pct.heightPct,
      });
      setFocusNoteId(note.id);
    } catch {
      cache.removeNote(tempId);
      setFocusNoteId(null);
      toast.error("Failed to create note.");
    }
  }

  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    void handleAddNote(event.clientX, event.clientY);
  }

  async function handleUpdate(
    id: string,
    patch: { content?: string; color?: NoteColor; pinned?: boolean },
  ) {
    const snap = {
      public: cache.getSnapshot("public"),
      private: cache.getSnapshot("private"),
    };

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

    cache.removeNote(id);
    if (focusNoteId === id) setFocusNoteId(null);

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      cache.setNotes("public", () => snap.public);
      cache.setNotes("private", () => snap.private);
      toast.error("Failed to delete note.");
    }
  }

  function handleLayoutChange(id: string, layout: NoteLayoutPixels) {
    void persistLayout(id, layoutToPct(layout, canvasSize.w, canvasSize.h));
  }

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "public", label: "Team Board", Icon: Globe },
    { key: "private", label: "My Notes", Icon: Lock },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute left-4 top-4 z-30 flex gap-1 rounded-xl border border-border/60 bg-background/90 p-1 shadow-sm backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
              activeTab === key
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        role="presentation"
        onClick={handleCanvasClick}
        className={cn(
          "relative h-full w-full cursor-crosshair overflow-hidden",
          "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.07)_1px,transparent_0)]",
          "bg-[length:24px_24px] bg-muted/40 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)]",
        )}
      >
        {sorted.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-xl border border-dashed border-border/50 bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              Click anywhere to drop a note
            </p>
          </div>
        )}

        {canvasSize.w > 0 && sorted.map((note, index) => {
          const layout = resolveNoteLayout(note, index, canvasSize.w, canvasSize.h);
          return (
            <StickyNoteCard
              key={note.id}
              note={note}
              layout={layout}
              canvasSize={canvasSize}
              zIndex={note.pinned ? 25 : 10 + index}
              autoFocus={focusNoteId === note.id}
              onAutoFocusHandled={() => {
                if (focusNoteId === note.id) setFocusNoteId(null);
              }}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onLayoutChange={(next) => handleLayoutChange(note.id, next)}
            />
          );
        })}
      </div>
    </div>
  );
}
