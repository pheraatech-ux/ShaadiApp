import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AppPageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Shared main-app page title block (matches Team and other `(main)` routes).
 * Use `actions` for right-aligned controls; omit for title + description only.
 */
export function AppPageHeader({ title, description, actions, className }: AppPageHeaderProps) {
  const titleDesc = (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description != null ? <div className="text-sm text-muted-foreground">{description}</div> : null}
    </>
  );

  if (actions) {
    return (
      <header
        className={cn(
          "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
          className,
        )}
      >
        <div className="min-w-0 space-y-1">{titleDesc}</div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      </header>
    );
  }

  return <section className={cn("space-y-1", className)}>{titleDesc}</section>;
}
