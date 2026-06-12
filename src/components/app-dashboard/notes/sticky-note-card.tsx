"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Pin, PinOff, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";

import type { StickyNote, NoteColor } from "@/components/app-dashboard/notes/types";
import { NOTE_COLOR_CLASSES, NOTE_COLOR_SWATCHES, NOTE_COLORS } from "@/components/app-dashboard/notes/types";
import { cn } from "@/lib/utils";

type StickyNoteCardProps = {
  note: StickyNote;
  onUpdate: (id: string, patch: { content?: string; color?: NoteColor; pinned?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function StickyNoteCard({ note, onUpdate, onDelete }: StickyNoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [showPalette, setShowPalette] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const colors = NOTE_COLOR_CLASSES[note.color];

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  // Auto-resize textarea
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  async function commitEdit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === note.content) return;
    try {
      await onUpdate(note.id, { content: trimmed });
    } catch {
      setDraft(note.content);
      toast.error("Failed to save note.");
    }
  }

  async function handleColorChange(color: NoteColor) {
    setShowPalette(false);
    if (color === note.color) return;
    try {
      await onUpdate(note.id, { color });
    } catch {
      toast.error("Failed to update color.");
    }
  }

  async function handlePin() {
    try {
      await onUpdate(note.id, { pinned: !note.pinned });
    } catch {
      toast.error("Failed to update pin.");
    }
  }

  // onDelete removes the note from cache instantly — card unmounts before the
  // promise resolves, so no local loading state is needed here.
  const handleDelete = useCallback(() => { void onDelete(note.id); }, [onDelete, note.id]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: undefined,
    });
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md",
        colors.card,
        colors.border,
      )}
    >
      {/* Top toolbar — visible on hover or when palette open */}
      <div
        className={cn(
          "mb-2 flex items-center justify-between gap-1 transition-opacity",
          showPalette ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {/* Color palette */}
        <div className="relative">
          <button
            onClick={() => setShowPalette((p) => !p)}
            className="flex size-6 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:text-foreground/70"
            aria-label="Change color"
          >
            <Palette className="size-3.5" />
          </button>
          {showPalette && (
            <div
              className={cn(
                "absolute left-0 top-7 z-10 flex gap-1.5 rounded-xl border border-border/60 bg-popover p-2 shadow-lg",
              )}
            >
              {NOTE_COLORS.map(({ value }) => (
                <button
                  key={value}
                  onClick={() => void handleColorChange(value)}
                  className={cn(
                    "size-5 rounded-full transition-transform hover:scale-110",
                    NOTE_COLOR_SWATCHES[value],
                    value === note.color && "ring-2 ring-offset-1 ring-foreground/30",
                  )}
                  aria-label={value}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {/* Pin */}
          {note.isCurrentUser && (
            <button
              onClick={() => void handlePin()}
              className={cn(
                "flex size-6 items-center justify-center rounded-lg transition-colors",
                note.pinned
                  ? cn(colors.pin, "opacity-100")
                  : "text-foreground/40 hover:text-foreground/70",
              )}
              aria-label={note.pinned ? "Unpin" : "Pin"}
            >
              {note.pinned ? <Pin className="size-3.5 fill-current" /> : <PinOff className="size-3.5" />}
            </button>
          )}

          {/* Delete — only author can delete */}
          {note.isCurrentUser && (
            <button
              onClick={handleDelete}
              className="flex size-6 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:text-rose-500"
              aria-label="Delete note"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned indicator (always visible when pinned) */}
      {note.pinned && (
        <div className={cn("absolute -top-1.5 right-3 flex items-center gap-1", colors.pin)}>
          <Pin className="size-3 fill-current" />
        </div>
      )}

      {/* Content area */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); autoResize(); }}
          onBlur={() => void commitEdit()}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setDraft(note.content); setEditing(false); }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void commitEdit();
          }}
          rows={1}
          className={cn(
            "w-full resize-none overflow-hidden rounded-lg border-0 p-0 text-sm leading-relaxed outline-none focus:ring-0",
            colors.textarea,
          )}
          placeholder="Write something…"
        />
      ) : (
        <p
          className={cn(
            "flex-1 cursor-text whitespace-pre-wrap text-sm leading-relaxed text-foreground/80",
            !note.content && "italic text-foreground/30",
          )}
          onClick={() => { if (note.isCurrentUser) { setEditing(true); setDraft(note.content); } }}
        >
          {note.content || (note.isCurrentUser ? "Click to add text…" : "")}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-current/10 pt-2">
        {note.visibility === "public" && !note.isCurrentUser ? (
          <span className="text-xs font-medium text-foreground/40">{note.authorLabel}</span>
        ) : (
          <span className="text-xs text-foreground/30">{note.isCurrentUser ? "You" : note.authorLabel}</span>
        )}
        <span className="text-xs text-foreground/30">{formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
