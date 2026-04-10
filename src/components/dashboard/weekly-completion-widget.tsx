import { WeeklyCompletionDay } from "@/components/dashboard/types";
import { SectionCard } from "@/components/dashboard/section-card";

type WeeklyCompletionWidgetProps = {
  items: WeeklyCompletionDay[];
};

export function WeeklyCompletionWidget({ items }: WeeklyCompletionWidgetProps) {
  return (
    <SectionCard title="This week's completion">
      <div className="grid grid-cols-5 items-end gap-2">
        {items.map((day) => (
          <div key={day.id} className="flex flex-col items-center gap-2">
            <div className="h-20 w-full rounded-lg bg-muted p-1">
              <div
                className="h-full w-full rounded-md bg-primary/85 transition-all"
                style={{ transform: `scaleY(${Math.max(0.1, Math.min(day.value, 100) / 100)})`, transformOrigin: "bottom" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{day.label}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
