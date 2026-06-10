"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ListFilter } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CalendarEventFilterType =
  | "personal"
  | "invited"
  | "wedding"
  | "ceremony"
  | "task"
  | "gcal";

const FILTER_OPTIONS: {
  value: CalendarEventFilterType;
  label: string;
  color: string;
  faded?: boolean;
  requiresGcal?: boolean;
}[] = [
  { value: "personal", label: "Personal events", color: "#6366f1" },
  { value: "invited", label: "Invited", color: "#6366f1", faded: true },
  { value: "wedding", label: "Wedding days", color: "#10b981" },
  { value: "ceremony", label: "Ceremony events", color: "#ec4899" },
  { value: "task", label: "Task deadlines", color: "#f59e0b" },
  { value: "gcal", label: "Google Calendar", color: "#4285F4", requiresGcal: true },
];

export function getDefaultEventFilters(googleCalConnected: boolean): Set<CalendarEventFilterType> {
  return new Set(
    FILTER_OPTIONS.filter((o) => !o.requiresGcal || googleCalConnected).map((o) => o.value),
  );
}

type Props = {
  selected: Set<CalendarEventFilterType>;
  onChange: (selected: Set<CalendarEventFilterType>) => void;
  googleCalConnected?: boolean;
  className?: string;
};

function FilterDot({ color, faded }: { color: string; faded?: boolean }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full border"
      style={{
        backgroundColor: faded ? `${color}80` : color,
        borderColor: color,
      }}
    />
  );
}

export function CalendarEventFilter({
  selected,
  onChange,
  googleCalConnected = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const visibleOptions = useMemo(
    () => FILTER_OPTIONS.filter((o) => !o.requiresGcal || googleCalConnected),
    [googleCalConnected],
  );

  const allSelected = visibleOptions.every((o) => selected.has(o.value));
  const triggerLabel = allSelected ? "All events" : `${selected.size} selected`;

  function toggleType(type: CalendarEventFilterType) {
    const next = new Set(selected);
    if (next.has(type)) {
      if (next.size <= 1) return;
      next.delete(type);
    } else {
      next.add(type);
    }
    onChange(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 shrink-0 items-center justify-between gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/50 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <ListFilter className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[184px] gap-0 p-1"
      >
        {visibleOptions.map(({ value, label, color, faded }) => {
          const isSelected = selected.has(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleType(value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                isSelected && "bg-accent/70",
              )}
            >
              <FilterDot color={color} faded={faded} />
              <span className="flex-1 text-left">{label}</span>
              {isSelected && <Check className="size-4 shrink-0 text-muted-foreground" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
