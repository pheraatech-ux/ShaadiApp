import { Badge } from "@/components/ui/badge";
import { TimelineCultureFilter } from "@/components/wedding-workspace/types";
import { cn } from "@/lib/utils";

type TimelineCultureFilterPillsProps = {
  filters: TimelineCultureFilter[];
};

const toneClass: Record<TimelineCultureFilter["tone"], string> = {
  punjabi:
    "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  tamil: "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  shared: "border-border/70 bg-muted/60 text-muted-foreground",
};

export function TimelineCultureFilterPills({ filters }: TimelineCultureFilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((f) => (
        <Badge
          key={f.id}
          variant="outline"
          className={cn("h-5 rounded-full px-2 text-[10px] font-medium", toneClass[f.tone])}
        >
          {f.label}
        </Badge>
      ))}
    </div>
  );
}
