"use client";

import { CalendarClock, CircleCheck, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CULTURE_MAP, type CultureId, type WeddingEvent } from "../../../../weddingCultures";

type ReviewConfirmPanelProps = {
  coupleLabel: string;
  weddingDateLabel: string;
  cityVenueLabel: string;
  selectedCultures: CultureId[];
  reviewEvents: WeddingEvent[];
  totalBudgetLabel: string;
  weddingDate?: Date;
};

export function ReviewConfirmPanel({
  coupleLabel,
  weddingDateLabel,
  cityVenueLabel,
  selectedCultures,
  reviewEvents,
  totalBudgetLabel,
}: ReviewConfirmPanelProps) {
  return (
    <div className="space-y-4 pl-1">
      <div>
        <h3 className="text-3xl font-semibold tracking-tight">Review and confirm</h3>
        <p className="mt-1 text-sm text-muted-foreground">Everything you have set across all four steps.</p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <CircleCheck className="size-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Wedding details</p>
          </div>
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Couple</p>
              <p className="text-sm font-semibold">{coupleLabel}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm font-semibold">{weddingDateLabel}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">City and venue</p>
              <p className="text-sm font-semibold">{cityVenueLabel}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Cultures</p>
              <p className="text-sm font-semibold">
                {selectedCultures.map((id) => CULTURE_MAP[id].shortName).join(" + ") || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Events ({reviewEvents.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-muted/20 px-3 py-3">
            {reviewEvents.map((event) => (
              <Badge key={event.id} variant="secondary" className="rounded-md text-[11px]">
                {event.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Budget summary</p>
          </div>
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Total budget</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{totalBudgetLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
