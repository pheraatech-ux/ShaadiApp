"use client";

import { useMemo, useState } from "react";
import { BookHeart, Check, ChevronDown, Search } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const VISIBLE_OPTION_COUNT = 3;
const OPTION_ROW_HEIGHT_CLASS = "min-h-12";

type WeddingOption = { slug: string; name: string };

type TasksWeddingFilterDropdownProps = {
  weddings: WeddingOption[];
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

function weddingInitials(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
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

function WeddingRow({
  active,
  onClick,
  wedding,
}: {
  active: boolean;
  onClick: () => void;
  wedding?: WeddingOption;
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
      {wedding ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-[11px] font-semibold text-rose-500">
          {weddingInitials(wedding.name)}
        </span>
      ) : (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <BookHeart className="size-3.5" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {wedding?.name ?? "All weddings"}
      </span>
    </button>
  );
}

export function TasksWeddingFilterDropdown({
  weddings,
  selected,
  onChange,
  expanded,
  onExpandedChange,
}: TasksWeddingFilterDropdownProps) {
  const [search, setSearch] = useState("");

  const summary = useMemo(() => {
    if (selected.size === 0) return "All weddings";
    if (selected.size === 1) {
      const slug = [...selected][0];
      return weddings.find((w) => w.slug === slug)?.name ?? "1 wedding";
    }
    return `${selected.size} weddings selected`;
  }, [selected, weddings]);

  const filteredWeddings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return weddings;
    return weddings.filter((wedding) => wedding.name.toLowerCase().includes(query));
  }, [search, weddings]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <BookHeart className="size-4 shrink-0 text-rose-500" />
        <span className="text-sm font-semibold text-foreground">Weddings</span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{summary}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="space-y-2 border-t border-border/60 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search weddings..."
              className="h-9 rounded-lg border-border/70 bg-background pl-9 text-sm"
            />
          </div>

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
              <WeddingRow active={selected.size === 0} onClick={() => onChange(new Set())} />
              {filteredWeddings.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">No weddings found.</p>
              ) : (
                filteredWeddings.map((wedding) => (
                  <WeddingRow
                    key={wedding.slug}
                    wedding={wedding}
                    active={selected.has(wedding.slug)}
                    onClick={() => onChange(toggleSetValue(selected, wedding.slug))}
                  />
                ))
              )}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      ) : null}
    </div>
  );
}
