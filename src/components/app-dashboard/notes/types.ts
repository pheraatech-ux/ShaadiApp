export type NoteColor = "yellow" | "pink" | "blue" | "green" | "purple";
export type NoteVisibility = "public" | "private";

export type StickyNote = {
  id: string;
  ownerUserId: string;
  authorUserId: string;
  authorLabel: string;
  content: string;
  color: NoteColor;
  visibility: NoteVisibility;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentUser: boolean;
};

export type StickyNotesBoardViewModel = {
  currentUserId: string;
  currentUserLabel: string;
  publicNotes: StickyNote[];
  privateNotes: StickyNote[];
};

export const NOTE_COLORS: { value: NoteColor; label: string }[] = [
  { value: "yellow",  label: "Yellow"  },
  { value: "pink",    label: "Pink"    },
  { value: "blue",    label: "Blue"    },
  { value: "green",   label: "Green"   },
  { value: "purple",  label: "Purple"  },
];

export const NOTE_COLOR_CLASSES: Record<NoteColor, {
  card: string;
  border: string;
  textarea: string;
  pin: string;
}> = {
  yellow: {
    card:     "bg-yellow-50 dark:bg-yellow-950/40",
    border:   "border-yellow-200 dark:border-yellow-800/60",
    textarea: "bg-yellow-50 dark:bg-yellow-950/40 placeholder:text-yellow-600/50 dark:placeholder:text-yellow-400/30",
    pin:      "text-yellow-500 dark:text-yellow-400",
  },
  pink: {
    card:     "bg-pink-50 dark:bg-pink-950/40",
    border:   "border-pink-200 dark:border-pink-800/60",
    textarea: "bg-pink-50 dark:bg-pink-950/40 placeholder:text-pink-600/50 dark:placeholder:text-pink-400/30",
    pin:      "text-pink-500 dark:text-pink-400",
  },
  blue: {
    card:     "bg-blue-50 dark:bg-blue-950/40",
    border:   "border-blue-200 dark:border-blue-800/60",
    textarea: "bg-blue-50 dark:bg-blue-950/40 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/30",
    pin:      "text-blue-500 dark:text-blue-400",
  },
  green: {
    card:     "bg-emerald-50 dark:bg-emerald-950/40",
    border:   "border-emerald-200 dark:border-emerald-800/60",
    textarea: "bg-emerald-50 dark:bg-emerald-950/40 placeholder:text-emerald-600/50 dark:placeholder:text-emerald-400/30",
    pin:      "text-emerald-500 dark:text-emerald-400",
  },
  purple: {
    card:     "bg-violet-50 dark:bg-violet-950/40",
    border:   "border-violet-200 dark:border-violet-800/60",
    textarea: "bg-violet-50 dark:bg-violet-950/40 placeholder:text-violet-600/50 dark:placeholder:text-violet-400/30",
    pin:      "text-violet-500 dark:text-violet-400",
  },
};

export const NOTE_COLOR_SWATCHES: Record<NoteColor, string> = {
  yellow: "bg-yellow-300 dark:bg-yellow-500",
  pink:   "bg-pink-300 dark:bg-pink-500",
  blue:   "bg-blue-300 dark:bg-blue-500",
  green:  "bg-emerald-300 dark:bg-emerald-500",
  purple: "bg-violet-300 dark:bg-violet-500",
};
