import { type ComponentType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

type NavItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  badge?: number;
};

type HeroAppPreviewSidebarProps = {
  items: readonly NavItem[];
  onItemClick: (e: React.MouseEvent) => void;
  footer: ReactNode;
  className?: string;
};

/**
 * In-flow sidebar (not shadcn Sidebar) so the preview stays within its frame
 * and never uses viewport-fixed / min-h-svh.
 */
export function HeroAppPreviewSidebar({ items, onItemClick, footer, className }: HeroAppPreviewSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-40 shrink-0 flex-col self-stretch border-r border-sidebar-border bg-sidebar text-sidebar-foreground sm:w-44 md:w-48",
        className,
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border/60 px-2 py-2.5 sm:px-3 sm:py-3">
        <div className="flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-2.5 sm:px-3">
          <p className="truncate text-center text-xs font-semibold tracking-tight sm:text-sm">ShaadiOS</p>
        </div>
      </div>
      <nav className="shrink-0 overflow-x-hidden px-2 py-2 sm:px-3">
        <p className="px-1.5 pb-1.5 text-[9px] font-medium uppercase tracking-wider text-sidebar-foreground/55">
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="group/menu-item relative">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={onItemClick}
                  className={cn(
                    "flex w-full cursor-default items-center gap-2 rounded-md py-2 pl-2.5 pr-2 text-left text-[12px] leading-tight sm:gap-2.5 sm:pl-3 sm:pr-2 sm:text-[13px]",
                    "text-sidebar-foreground transition-colors",
                    "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    item.active &&
                      "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                  data-active={item.active || undefined}
                  aria-current={item.active ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0 sm:size-5" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge != null && (
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-medium tabular-nums sm:px-2 sm:text-[9px]",
                        item.active
                          ? "bg-primary/20 text-primary"
                          : "bg-sidebar-accent/30 text-sidebar-foreground/80",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-h-0 flex-1" aria-hidden />
      <div className="shrink-0 border-t border-sidebar-border/50 p-2 sm:p-2.5">{footer}</div>
    </aside>
  );
}

export function HeroAppPreviewUserFooter() {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5">
      <Skeleton className="size-7 shrink-0 rounded-full sm:size-8" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-[10px] font-medium sm:text-xs">Priya Mehta</p>
        <p className="text-[9px] text-muted-foreground sm:text-[10px]">Studio</p>
      </div>
    </div>
  );
}
