import { Search, Sparkles } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/app-dashboard/dashboard/theme-toggle";

type DashboardTopbarProps = {
  greeting: string;
  searchPlaceholder?: string;
  actions?: ReactNode;
};

export function DashboardTopbar({
  greeting: _greeting,
  searchPlaceholder = "Search weddings, tasks, vendors...",
  actions,
}: DashboardTopbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Dashboard</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden w-full max-w-sm items-center sm:flex">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <Input
            className="h-9 rounded-xl border-border/70 bg-muted/40 pl-9"
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl">
          <Sparkles />
          AI Assistant
        </Button>
        {actions}
        <ThemeToggle />
      </div>
    </div>
  );
}
