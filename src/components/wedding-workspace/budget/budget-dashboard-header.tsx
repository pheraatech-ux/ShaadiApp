import { CalendarDays, MapPin, Plus, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BudgetDashboardHeaderProps = {
  coupleName: string;
  weddingDate: string | null;
  venueName: string | null;
  city: string | null;
  cultures: string[];
  onAddCategory: () => void;
};

function getInitials(coupleName: string) {
  return coupleName
    .split(/\s*&\s*|\s+and\s+/i)
    .map((n) => n.trim()[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatWeddingDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getWeddingDayStatus(dateStr: string | null): "today" | "upcoming" | "past" | null {
  if (!dateStr) return null;
  const today = new Date();
  const wedding = new Date(dateStr);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weddingMidnight = new Date(wedding.getFullYear(), wedding.getMonth(), wedding.getDate());
  const diff = weddingMidnight.getTime() - todayMidnight.getTime();
  if (diff === 0) return "today";
  if (diff > 0) return "upcoming";
  return "past";
}

export function BudgetDashboardHeader({
  coupleName,
  weddingDate,
  venueName,
  city,
  cultures,
  onAddCategory,
}: BudgetDashboardHeaderProps) {
  const initials = getInitials(coupleName);
  const dayStatus = getWeddingDayStatus(weddingDate);
  const locationParts = [venueName, city].filter(Boolean).join(", ");

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold">{coupleName}</span>
              {dayStatus === "today" && (
                <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  Wedding Day
                </Badge>
              )}
              {dayStatus === "upcoming" && (
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Upcoming
                </Badge>
              )}
              {dayStatus === "past" && (
                <Badge variant="outline" className="text-muted-foreground">
                  Completed
                </Badge>
              )}
              {cultures.map((c) => (
                <Badge key={c} variant="secondary" className="text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {weddingDate && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" />
                  {formatWeddingDate(weddingDate)}
                </span>
              )}
              {locationParts && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {locationParts}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" disabled>
          <Download className="size-3.5" />
          Export to Excel
        </Button>
        <Button size="sm" className="gap-1.5 rounded-xl" onClick={onAddCategory}>
          <Plus className="size-3.5" />
          Add category
        </Button>
      </div>
    </div>
  );
}
