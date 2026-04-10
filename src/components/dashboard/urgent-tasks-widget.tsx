import { CheckCircle2, Circle } from "lucide-react";

import { SectionCard } from "@/components/dashboard/section-card";
import { UrgentTaskItem } from "@/components/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UrgentTasksWidgetProps = {
  items: UrgentTaskItem[];
};

export function UrgentTasksWidget({ items }: UrgentTasksWidgetProps) {
  return (
    <SectionCard
      title="Urgent tasks"
      action={
        <Button variant="ghost" size="sm" className="rounded-xl">
          All tasks
        </Button>
      }
    >
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2",
              item.completed && "bg-muted/40",
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
            <p
              className={cn(
                "flex-1 text-sm",
                item.completed && "text-muted-foreground line-through",
              )}
            >
              {item.title}
            </p>
            {item.overdueLabel ? (
              <Badge variant="destructive" className="rounded-full text-[10px] uppercase">
                {item.overdueLabel}
              </Badge>
            ) : (
              <Badge variant={item.completed ? "secondary" : "outline"} className="rounded-full text-[10px]">
                {item.owner}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
