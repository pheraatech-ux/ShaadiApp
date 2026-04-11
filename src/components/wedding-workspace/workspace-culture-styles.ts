import { cn } from "@/lib/utils";

/** Maps culture label (from data) to pill tone. */
const CULTURE_TONE_BY_LABEL: Record<string, "punjabi" | "tamil"> = {
  Punjabi: "punjabi",
  Tamil: "tamil",
};

const CULTURE_BADGE_BY_TONE: Record<"punjabi" | "tamil", string> = {
  punjabi:
    "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  tamil: "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100",
};

const CULTURE_FALLBACK = "border-border/70 bg-muted/40 text-muted-foreground";

export function getCultureBadgeClassName(tag: string) {
  const tone = CULTURE_TONE_BY_LABEL[tag];
  if (!tone) return CULTURE_FALLBACK;
  return cn("rounded-md text-[10px] font-medium", CULTURE_BADGE_BY_TONE[tone]);
}

/** For team page structured tags */
export function getCultureBadgeClassNameFromTone(tone: "punjabi" | "tamil") {
  return cn("rounded-md text-[10px] font-medium", CULTURE_BADGE_BY_TONE[tone]);
}
