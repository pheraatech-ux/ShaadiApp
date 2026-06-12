"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { Pin, PinOff, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";

import type { NoteLayoutPixels } from "@/components/app-dashboard/notes/canvas-utils";
import { clampNoteLayout } from "@/components/app-dashboard/notes/canvas-utils";
import type { StickyNote, NoteColor } from "@/components/app-dashboard/notes/types";
import { NOTE_COLOR_CLASSES, NOTE_COLOR_SWATCHES, NOTE_COLORS } from "@/components/app-dashboard/notes/types";
import { cn } from "@/lib/utils";

type StickyNoteCardProps = {
  note: StickyNote;
  layout: NoteLayoutPixels;
  canvasBounds: { w: number; h: number };
  canvasReference: { w: number; h: number };
  canvasZoom?: number;
  zIndex?: number;
  autoFocus?: boolean;
  onAutoFocusHandled?: () => void;
  onUpdate: (id: string, patch: { content?: string; color?: NoteColor; pinned?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLayoutChange: (layout: NoteLayoutPixels) => void;
};

const badgeBtnClass = cn(
  "flex size-7 items-center justify-center rounded-full",
  "border border-border/80 bg-background text-foreground/60 shadow-md",
  "transition-all hover:scale-105 hover:text-foreground",
  "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
);

export function StickyNoteCard({
  note,
  layout,
  canvasBounds,
  canvasReference,
  canvasZoom = 1,
  zIndex = 10,
  autoFocus = false,
  onAutoFocusHandled,
  onUpdate,
  onDelete,
  onLayoutChange,
}: StickyNoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [showPalette, setShowPalette] = useState(false);
  const [liveLayout, setLiveLayout] = useState<NoteLayoutPixels | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; orig: NoteLayoutPixels; dragging: boolean } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; orig: NoteLayoutPixels } | null>(null);

  const colors = NOTE_COLOR_CLASSES[note.color];
  const showControls = note.isCurrentUser;
  const canAdjustLayout = note.visibility === "public" || note.isCurrentUser;
  const controlsVisible = showPalette || note.pinned;
  const display = liveLayout ?? layout;

  useEffect(() => {
    setDraft(note.content);
  }, [note.content]);

  useEffect(() => {
    if (autoFocus && note.isCurrentUser) {
      setEditing(true);
      onAutoFocusHandled?.();
    }
  }, [autoFocus, note.isCurrentUser, onAutoFocusHandled]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      autoResize();
    }
  }, [editing]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function stopCanvas(event: React.SyntheticEvent) {
    event.stopPropagation();
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

  const handleDelete = useCallback(() => { void onDelete(note.id); }, [onDelete, note.id]);

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function onDragPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (editing) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      orig: display,
      dragging: true,
    };
  }

  function onDragPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current?.dragging) return;
    const dx = (event.clientX - dragRef.current.startX) / canvasZoom;
    const dy = (event.clientY - dragRef.current.startY) / canvasZoom;
    const next = clampNoteLayout(
      dragRef.current.orig.x + dx,
      dragRef.current.orig.y + dy,
      dragRef.current.orig.w,
      dragRef.current.orig.h,
      canvasBounds.w,
      canvasBounds.h,
      canvasReference.w,
      canvasReference.h,
    );
    setLiveLayout(next);
  }

  function onDragPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (dragRef.current.dragging) {
      const finalLayout = liveLayout ?? dragRef.current.orig;
      onLayoutChange(finalLayout);
    }
    dragRef.current = null;
    setLiveLayout(null);
  }

  const dragEdgeHandlers = {
    onPointerDown: onDragPointerDown,
    onPointerMove: onDragPointerMove,
    onPointerUp: onDragPointerUp,
    onPointerCancel: onDragPointerUp,
  };

  const dragEdgeClass = cn(
    "absolute z-[1] touch-none",
    "cursor-grab active:cursor-grabbing",
  );

  function onResizePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      orig: display,
    };
  }

  function onResizePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizeRef.current) return;
    const dx = (event.clientX - resizeRef.current.startX) / canvasZoom;
    const dy = (event.clientY - resizeRef.current.startY) / canvasZoom;
    const next = clampNoteLayout(
      resizeRef.current.orig.x,
      resizeRef.current.orig.y,
      resizeRef.current.orig.w + dx,
      resizeRef.current.orig.h + dy,
      canvasBounds.w,
      canvasBounds.h,
      canvasReference.w,
      canvasReference.h,
    );
    setLiveLayout(next);
  }

  function onResizePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizeRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const finalLayout = liveLayout ?? resizeRef.current.orig;
    resizeRef.current = null;
    setLiveLayout(null);
    onLayoutChange(finalLayout);
  }

  const cardStyle: CSSProperties = {
    left: display.x,
    top: display.y,
    width: display.w,
    height: display.h,
    zIndex,
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      className="group absolute overflow-visible"
      onClick={stopCanvas}
      onPointerDown={stopCanvas}
    >
      <div
        className={cn(
          "relative z-0 flex h-full flex-col rounded-2xl border p-4 shadow-md transition-shadow group-hover:shadow-lg",
          colors.card,
          colors.border,
        )}
      >
        {!editing && canAdjustLayout && (
          <>
            <div className={cn(dragEdgeClass, "inset-x-0 top-0 h-[10%]")} {...dragEdgeHandlers} aria-hidden />
            <div className={cn(dragEdgeClass, "inset-x-0 bottom-0 h-[10%]")} {...dragEdgeHandlers} aria-hidden />
            <div className={cn(dragEdgeClass, "inset-y-[10%] left-0 w-[10%]")} {...dragEdgeHandlers} aria-hidden />
            <div className={cn(dragEdgeClass, "inset-y-[10%] right-0 w-[10%]")} {...dragEdgeHandlers} aria-hidden />
          </>
        )}

        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); autoResize(); }}
            onBlur={() => void commitEdit()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setDraft(note.content); setEditing(false); }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void commitEdit();
            }}
            rows={4}
            className={cn(
              "w-full flex-1 resize-none overflow-hidden rounded-lg border-0 p-0 text-sm leading-relaxed outline-none focus:ring-0",
              colors.textarea,
            )}
            placeholder="Write something…"
          />
        ) : (
          <p
            className={cn(
              "relative z-[1] flex-1 overflow-hidden whitespace-pre-wrap text-sm leading-relaxed text-foreground/80",
              !note.content && "italic text-foreground/30",
              note.isCurrentUser && "cursor-text",
            )}
            onClick={() => { if (note.isCurrentUser) { setEditing(true); setDraft(note.content); } }}
          >
            {note.content || (note.isCurrentUser ? "Click to add text…" : "")}
          </p>
        )}

        <div className="relative z-[1] mt-auto flex items-end justify-between gap-2 border-t border-current/10 pt-2">
          <span className="text-xs text-foreground/40">{formatTimestamp(note.createdAt)}</span>
          {note.visibility === "public" && !note.isCurrentUser ? (
            <span className="text-xs font-medium text-foreground/40">{note.authorLabel}</span>
          ) : (
            <span className="text-xs text-foreground/30">{note.isCurrentUser ? "You" : note.authorLabel}</span>
          )}
        </div>

        {canAdjustLayout && (
          <div
            role="presentation"
            data-resize-handle
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
            className="absolute bottom-0 right-0 z-[3] cursor-se-resize p-2 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Resize note"
          >
            <div className="flex flex-col items-end gap-[3px]" aria-hidden>
              <span className="size-[3px] rounded-full bg-foreground/45" />
              <div className="flex gap-[3px]">
                <span className="size-[3px] rounded-full bg-foreground/45" />
                <span className="size-[3px] rounded-full bg-foreground/45" />
              </div>
              <div className="flex gap-[3px]">
                <span className="size-[3px] rounded-full bg-foreground/45" />
                <span className="size-[3px] rounded-full bg-foreground/45" />
                <span className="size-[3px] rounded-full bg-foreground/45" />
              </div>
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => void handlePin()}
            className={cn(
              badgeBtnClass,
              "absolute -left-1.5 -top-1.5 z-30",
              (note.pinned || controlsVisible) && "opacity-100",
              note.pinned && cn(colors.pin, "border-current/30"),
            )}
            aria-label={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? <Pin className="size-3.5 fill-current" /> : <PinOff className="size-3.5" />}
          </button>

          <div
            className={cn(
              "absolute -right-1.5 -top-1.5 z-30 flex items-center gap-1",
              showPalette && "z-40",
              controlsVisible && "[&>button]:opacity-100 [&_.badge-btn]:opacity-100",
            )}
          >
            <button
              type="button"
              onClick={handleDelete}
              className={cn(badgeBtnClass, "badge-btn hover:text-rose-500", controlsVisible && "opacity-100")}
              aria-label="Delete note"
            >
              <Trash2 className="size-3.5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPalette((p) => !p)}
                className={cn(badgeBtnClass, "badge-btn", (showPalette || controlsVisible) && "opacity-100")}
                aria-label="Change color"
              >
                <Palette className="size-3.5" />
              </button>
              {showPalette && (
                <div className="absolute right-0 top-8 z-40 flex gap-1.5 rounded-xl border border-border/60 bg-popover p-2 shadow-lg">
                  {NOTE_COLORS.map(({ value }) => (
                    <button
                      key={value}
                      type="button"
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
          </div>
        </>
      )}
    </div>
  );
}
