"use client";

import { useState } from "react";
import { Calendar, CalendarClock, CalendarDays, Check, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CalendarViewMode = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

const VIEW_MODES: {
  value: CalendarViewMode;
  label: string;
  icon: typeof Calendar;
}[] = [
  { value: "dayGridMonth", label: "Month View", icon: Calendar },
  { value: "timeGridWeek", label: "Week View", icon: CalendarDays },
  { value: "timeGridDay", label: "Day View", icon: CalendarClock },
];

type Props = {
  value: CalendarViewMode;
  onChange: (value: CalendarViewMode) => void;
  className?: string;
};

export function CalendarViewModeSelector({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const selected = VIEW_MODES.find((mode) => mode.value === value) ?? VIEW_MODES[0];
  const SelectedIcon = selected.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 min-w-[158px] items-center justify-between gap-2 rounded-lg border border-border/70 bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/50 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <SelectedIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{selected.label}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-(--anchor-width) max-w-(--anchor-width) gap-0 p-1"
      >
        {VIEW_MODES.map(({ value: mode, label, icon: Icon }) => {
          const isSelected = value === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => {
                onChange(mode);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent",
                isSelected && "bg-accent/70",
              )}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">{label}</span>
              {isSelected && <Check className="size-4 shrink-0 text-muted-foreground" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
