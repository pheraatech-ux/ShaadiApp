import { Clock } from "lucide-react";

import { RecentActivityItem } from "@/components/app-dashboard/dashboard/types";
import { cn } from "@/lib/utils";

type RecentActivityWidgetProps = {
  items: RecentActivityItem[];
};

export function RecentActivityWidget({ items }: RecentActivityWidgetProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Header — min-h matches wedding widget header driven by size="sm" button (h-8 + py-1.5 = 44px) */}
      <div className="flex min-h-[41px] shrink-0 items-center gap-2 border-b border-border/70 px-4 sm:px-5">
        <Clock className="size-3.5 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Recent Activity</p>
      </div>

      {/* Rows */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-2.5 dark:bg-muted/25"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  item.initialsClassName,
                )}
              >
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight text-foreground">{item.text}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
