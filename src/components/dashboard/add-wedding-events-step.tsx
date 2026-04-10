"use client";

import { cn } from "@/lib/utils";
import type { CultureId, WeddingEvent } from "../../../weddingCultures";
import { CultureSelector } from "@/components/dashboard/add-wedding-events/culture-selector";
import { ReviewEventsTab } from "@/components/dashboard/add-wedding-events/review-events-tab";

export type EventsTab = "choose-culture" | "review-events";

type AddWeddingEventsStepProps = {
  selectedCultures: CultureId[];
  onSelectedCulturesChange: (next: CultureId[]) => void;
  reviewEvents: WeddingEvent[];
  onReviewEventsChange: (next: WeddingEvent[]) => void;
  activeTab: EventsTab;
  onActiveTabChange: (next: EventsTab) => void;
  showCultureError?: boolean;
};

export function AddWeddingEventsStep({
  selectedCultures,
  onSelectedCulturesChange,
  reviewEvents,
  onReviewEventsChange,
  activeTab,
  onActiveTabChange,
  showCultureError = false,
}: AddWeddingEventsStepProps) {
  return (
    <div className="space-y-4">
      <div className="border-b">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onActiveTabChange("choose-culture")}
            className={cn(
              "border-b-2 px-2 py-2 text-sm font-medium transition-colors",
              activeTab === "choose-culture"
                ? "border-emerald-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Choose culture
          </button>
          <button
            type="button"
            onClick={() => onActiveTabChange("review-events")}
            className={cn(
              "border-b-2 px-2 py-2 text-sm font-medium transition-colors",
              activeTab === "review-events"
                ? "border-emerald-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Review events
          </button>
        </div>
      </div>

      {activeTab === "choose-culture" ? (
        <CultureSelector
          selectedCultures={selectedCultures}
          onSelectedCulturesChange={onSelectedCulturesChange}
          showCultureError={showCultureError}
        />
      ) : (
        <ReviewEventsTab
          selectedCultures={selectedCultures}
          reviewEvents={reviewEvents}
          onReviewEventsChange={onReviewEventsChange}
        />
      )}
    </div>
  );
}
