import { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  /** Content between title and action (e.g. filters). */
  middle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  middle,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 py-0",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {/* Subtle top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <CardHeader
        className={cn(
          "border-b border-border/70 px-4 py-3 sm:px-5",
          "bg-gradient-to-b from-muted/40 to-transparent",
          headerClassName,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
            <CardTitle className="shrink-0 text-sm font-semibold tracking-tight">
              {title}
            </CardTitle>
            {middle}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      </CardHeader>

      <CardContent className={cn("px-4 py-4 sm:px-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
