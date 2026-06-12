import {
  DEFAULT_NOTE_HEIGHT_PCT,
  DEFAULT_NOTE_WIDTH_PCT,
  MIN_NOTE_HEIGHT_PCT,
  MIN_NOTE_WIDTH_PCT,
  NOTE_CANVAS_HEIGHT,
  NOTE_CANVAS_WIDTH,
  type StickyNote,
} from "@/components/app-dashboard/notes/types";

export type NoteLayoutPixels = { x: number; y: number; w: number; h: number };

/** Values > 1 are legacy absolute pixels from before responsive layout. */
export function isLegacyPixelValue(value: number) {
  return value > 1;
}

export function pctToPixels(
  pct: number | null | undefined,
  canvasSize: number,
  defaultPct: number,
): number {
  if (pct == null) return defaultPct * canvasSize;
  if (isLegacyPixelValue(pct)) return pct;
  return pct * canvasSize;
}

export function pixelsToPct(pixels: number, canvasSize: number): number {
  if (canvasSize <= 0) return 0;
  return Math.max(0, Math.min(1, pixels / canvasSize));
}

export function clampNoteLayout(
  x: number,
  y: number,
  w: number,
  h: number,
  canvasWidth: number,
  canvasHeight: number,
): NoteLayoutPixels {
  const inset = 8;
  const minW = MIN_NOTE_WIDTH_PCT * canvasWidth;
  const minH = MIN_NOTE_HEIGHT_PCT * canvasHeight;
  const clampedW = Math.max(minW, Math.min(w, canvasWidth - inset * 2));
  const clampedH = Math.max(minH, Math.min(h, canvasHeight - inset * 2));
  const maxX = Math.max(inset, canvasWidth - clampedW - inset);
  const maxY = Math.max(inset, canvasHeight - clampedH - inset);

  return {
    x: Math.max(inset, Math.min(x, maxX)),
    y: Math.max(inset, Math.min(y, maxY)),
    w: clampedW,
    h: clampedH,
  };
}

export function resolveNoteLayout(
  note: StickyNote,
  index: number,
  canvasWidth: number,
  canvasHeight: number,
): NoteLayoutPixels {
  const w = pctToPixels(note.widthPct, canvasWidth, DEFAULT_NOTE_WIDTH_PCT);
  const h = pctToPixels(note.heightPct, canvasHeight, DEFAULT_NOTE_HEIGHT_PCT);

  if (note.posX != null && note.posY != null) {
    const x = isLegacyPixelValue(note.posX) ? note.posX : note.posX * canvasWidth;
    const y = isLegacyPixelValue(note.posY) ? note.posY : note.posY * canvasHeight;
    return clampNoteLayout(x, y, w, h, canvasWidth, canvasHeight);
  }

  const fallbackX = 48 + (index % 4) * (NOTE_CANVAS_WIDTH + 32);
  const fallbackY = 48 + Math.floor(index / 4) * (NOTE_CANVAS_HEIGHT + 32);
  return clampNoteLayout(fallbackX, fallbackY, w, h, canvasWidth, canvasHeight);
}

export function clampNotePosition(
  x: number,
  y: number,
  noteWidth: number,
  noteHeight: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  const { x: cx, y: cy } = clampNoteLayout(x, y, noteWidth, noteHeight, canvasWidth, canvasHeight);
  return { x: cx, y: cy };
}

export function layoutToPct(layout: NoteLayoutPixels, canvasWidth: number, canvasHeight: number) {
  return {
    posX: pixelsToPct(layout.x, canvasWidth),
    posY: pixelsToPct(layout.y, canvasHeight),
    widthPct: pixelsToPct(layout.w, canvasWidth),
    heightPct: pixelsToPct(layout.h, canvasHeight),
  };
}
