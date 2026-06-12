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
  boundsWidth: number,
  boundsHeight: number,
  referenceWidth: number = boundsWidth,
  referenceHeight: number = boundsHeight,
): NoteLayoutPixels {
  const inset = 8;
  const minW = MIN_NOTE_WIDTH_PCT * referenceWidth;
  const minH = MIN_NOTE_HEIGHT_PCT * referenceHeight;
  const clampedW = Math.max(minW, Math.min(w, boundsWidth - inset * 2));
  const clampedH = Math.max(minH, Math.min(h, boundsHeight - inset * 2));
  const maxX = Math.max(inset, boundsWidth - clampedW - inset);
  const maxY = Math.max(inset, boundsHeight - clampedH - inset);

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
  referenceWidth: number,
  referenceHeight: number,
  boundsWidth: number = referenceWidth,
  boundsHeight: number = referenceHeight,
): NoteLayoutPixels {
  const w = pctToPixels(note.widthPct, referenceWidth, DEFAULT_NOTE_WIDTH_PCT);
  const h = pctToPixels(note.heightPct, referenceHeight, DEFAULT_NOTE_HEIGHT_PCT);

  if (note.posX != null && note.posY != null) {
    const x = isLegacyPixelValue(note.posX) ? note.posX : note.posX * referenceWidth;
    const y = isLegacyPixelValue(note.posY) ? note.posY : note.posY * referenceHeight;
    return clampNoteLayout(x, y, w, h, boundsWidth, boundsHeight, referenceWidth, referenceHeight);
  }

  const fallbackX = 48 + (index % 4) * (NOTE_CANVAS_WIDTH + 32);
  const fallbackY = 48 + Math.floor(index / 4) * (NOTE_CANVAS_HEIGHT + 32);
  return clampNoteLayout(fallbackX, fallbackY, w, h, boundsWidth, boundsHeight, referenceWidth, referenceHeight);
}

export function clampNotePosition(
  x: number,
  y: number,
  noteWidth: number,
  noteHeight: number,
  boundsWidth: number,
  boundsHeight: number,
  referenceWidth: number = boundsWidth,
  referenceHeight: number = boundsHeight,
) {
  const { x: cx, y: cy } = clampNoteLayout(
    x,
    y,
    noteWidth,
    noteHeight,
    boundsWidth,
    boundsHeight,
    referenceWidth,
    referenceHeight,
  );
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
