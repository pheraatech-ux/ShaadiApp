"use client";

import { CalendarClock, CircleCheck, ClipboardList, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateTasksForWedding, CULTURE_MAP, type CultureId, type WeddingEvent } from "../../../../weddingCultures";

type ReviewConfirmPanelProps = {
  coupleLabel: string;
  weddingDateLabel: string;
  cityVenueLabel: string;
  selectedCultures: CultureId[];
  reviewEvents: WeddingEvent[];
  totalBudgetLabel: string;
  plannerFeeLabel: string;
  paymentTermsLabel: string;
  advanceDueLabel: string;
  weddingDate?: Date;
};

function formatTaskDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ReviewConfirmPanel({
  coupleLabel,
  weddingDateLabel,
  cityVenueLabel,
  selectedCultures,
  reviewEvents,
  totalBudgetLabel,
  plannerFeeLabel,
  paymentTermsLabel,
  advanceDueLabel,
  weddingDate,
}: ReviewConfirmPanelProps) {
  const referenceWeddingDate = weddingDate ?? new Date("2030-01-01T00:00:00Z");
  const tasks = generateTasksForWedding(
    reviewEvents.map((event) => event.id),
    referenceWeddingDate,
  );
  const previewTasks = tasks.slice(0, 5);
  const remainingTaskCount = Math.max(tasks.length - previewTasks.length, 0);

  return (
    <div className="space-y-4 pl-1">
      <div>
        <h3 className="text-3xl font-semibold tracking-tight">Review and confirm</h3>
        <p className="mt-1 text-sm text-muted-foreground">Everything you have set across all three steps.</p>
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Planner fee</p>
              <p className="text-sm font-semibold">{plannerFeeLabel}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Payment terms</p>
              <p className="text-sm font-semibold">{paymentTermsLabel}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/70 pt-2">
              <p className="text-sm font-semibold">Advance due on signing</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{advanceDueLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Starter checklist</p>
          </div>

          <div className="rounded-xl border border-violet-200/60 bg-violet-100/60 px-3 py-2 text-sm text-violet-900 dark:border-violet-400/40 dark:bg-violet-950/30 dark:text-violet-100">
            Starter task checklist — {tasks.length} tasks across {reviewEvents.length} events
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20">
            {previewTasks.map((task, idx) => (
              <div key={task.id} className={`px-3 py-2 text-sm ${idx > 0 ? "border-t border-border/70" : ""}`}>
                {task.text} - due {formatTaskDate(task.dueDate)}
              </div>
            ))}
            {remainingTaskCount > 0 ? (
              <div className="border-t border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground">
                + {remainingTaskCount} more tasks across all events
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
