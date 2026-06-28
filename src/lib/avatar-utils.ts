export const AVATAR_PALETTES = [
  {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-400/40",
  },
  {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-400/40",
  },
  {
    bg: "bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-400/40",
  },
  {
    bg: "bg-amber-500/10",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-400/40",
  },
  {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-400/40",
  },
  {
    bg: "bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-400/40",
  },
] as const;

export type AvatarPalette = (typeof AVATAR_PALETTES)[number];

export function getInitialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  if (trimmed.includes("&")) {
    return trimmed
      .split("&")
      .map((part) => part.trim().charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  return parts[0].charAt(0).toUpperCase();
}

export function avatarPaletteForName(name: string): AvatarPalette {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTES.length;
  }
  return AVATAR_PALETTES[Math.abs(hash)];
}
