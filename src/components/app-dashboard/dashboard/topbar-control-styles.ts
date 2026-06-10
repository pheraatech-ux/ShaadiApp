/** Shared shell styling for topbar pills, icon buttons, and search. */
export const topbarControlClassName = [
  "rounded-xl border border-border/60 bg-card",
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_2px_8px_rgba(0,0,0,0.05)]",
  "transition-all duration-150",
  "hover:border-border hover:shadow-[0_1px_4px_rgba(0,0,0,0.07),_0_4px_12px_rgba(0,0,0,0.07)]",
].join(" ");

export const topbarIconButtonClassName = [
  topbarControlClassName,
  "text-foreground/70 hover:bg-card hover:text-foreground",
  "dark:border-border/60 dark:bg-card dark:hover:bg-card/95",
].join(" ");
