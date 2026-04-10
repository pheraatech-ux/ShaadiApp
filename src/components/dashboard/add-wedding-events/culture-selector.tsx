"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { CULTURES, getEventsForCultures, type Culture, type CultureId } from "../../../../weddingCultures";

type CultureSelectorProps = {
  selectedCultures: CultureId[];
  onSelectedCulturesChange: (next: CultureId[]) => void;
  showCultureError?: boolean;
};

const regionLabels: Record<Culture["region"], string> = {
  north: "North India",
  south: "South India",
  east: "East and North East India",
  west: "West India and Communities",
};

const regionOrder: Culture["region"][] = ["north", "south", "east", "west"];

export function CultureSelector({
  selectedCultures,
  onSelectedCulturesChange,
  showCultureError,
}: CultureSelectorProps) {
  const grouped = useMemo(() => {
    return regionOrder.map((region) => ({
      region,
      label: regionLabels[region],
      cultures: CULTURES.filter((item) => item.region === region),
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-3xl font-semibold tracking-tight">Which cultures does this wedding celebrate?</h3>
        <p className="text-sm text-muted-foreground">
          Select one or more. For cross-cultural weddings, select both and the events will be combined without duplicates.
        </p>
      </div>

      {grouped.map((group) => (
        <section key={group.region} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{group.label}</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.cultures.map((culture) => {
              const isSelected = selectedCultures.includes(culture.id);
              return (
                <button
                  key={culture.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onSelectedCulturesChange(selectedCultures.filter((id) => id !== culture.id));
                      return;
                    }
                    onSelectedCulturesChange([...selectedCultures, culture.id]);
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "border-emerald-500/60 bg-emerald-500/10 text-foreground"
                      : "border-border/70 bg-card hover:border-emerald-500/40 hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-semibold">{culture.name}</p>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="rounded-xl border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
        {selectedCultures.length} culture selected
        {selectedCultures.length === 1 ? "" : "s"} and {getEventsForCultures(selectedCultures).length} events loaded.
      </div>

      {showCultureError && selectedCultures.length === 0 ? (
        <p className="text-sm font-medium text-destructive">Please select at least one culture to continue.</p>
      ) : null}
    </div>
  );
}
