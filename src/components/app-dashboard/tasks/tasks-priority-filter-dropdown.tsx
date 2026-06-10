"use client";

import { useMemo, type ReactNode } from "react";
import { Check, ChevronDown, Flag } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@/lib/utils";

const VISIBLE_OPTION_COUNT = 3;
const OPTION_ROW_HEIGHT_CLASS = "min-h-12";

const PRIORITY_OPTIONS = [
  { value: "high", label: "High", dotClassName: "bg-rose-500" },
  { value: "medium", label: "Medium", dotClassName: "bg-amber-500" },
  { value: "low", label: "Low", dotClassName: "bg-emerald-500" },
] as const;

type TasksPriorityFilterDropdownProps = {
  selected: Set<string>;
  onChange: (filters: Set<string>) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

function toggleSetValue(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function SelectionCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-background",
      )}
    >
      {checked ? <Check className="size-2.5 stroke-[3]" /> : null}
    </span>
  );
}

function PriorityRow({
  active,
  onClick,
  label,
  avatar,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  avatar: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
        OPTION_ROW_HEIGHT_CLASS,
        active && "bg-accent/60",
      )}
    >
      <SelectionCheckbox checked={active} />
      {avatar}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

export function TasksPriorityFilterDropdown({
  selected,
  onChange,
  expanded,
  onExpandedChange,
}: TasksPriorityFilterDropdownProps) {
  const summary = useMemo(() => {
    if (selected.size === 0) return "All priority";
    if (selected.size === 1) {
      const value = [...selected][0];
      return PRIORITY_OPTIONS.find((option) => option.value === value)?.label ?? "1 priority";
    }
    return `${selected.size} priorities selected`;
  }, [selected]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Flag className="size-4 shrink-0 text-amber-500" />
        <span className="text-sm font-semibold text-foreground">Priority</span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{summary}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="border-t border-border/60 p-2">
          <OverlayScrollbarsComponent
            element="div"
            style={{ maxHeight: `calc(${VISIBLE_OPTION_COUNT} * 3rem + ${VISIBLE_OPTION_COUNT - 1} * 0.125rem)` }}
            options={{
              overflow: { x: "hidden", y: "scroll" },
              scrollbars: { theme: "os-theme-dark", autoHide: "never", clickScroll: true },
            }}
            defer
          >
            <div className="space-y-0.5 pr-1">
              <PriorityRow
                active={selected.size === 0}
                onClick={() => onChange(new Set())}
                label="All priority"
                avatar={
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Flag className="size-3.5" />
                  </span>
                }
              />
              {PRIORITY_OPTIONS.map((option) => (
                <PriorityRow
                  key={option.value}
                  active={selected.has(option.value)}
                  onClick={() => onChange(toggleSetValue(selected, option.value))}
                  label={option.label}
                  avatar={
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
                      <span className={cn("size-2.5 rounded-full", option.dotClassName)} />
                    </span>
                  }
                />
              ))}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      ) : null}
    </div>
  );
}
