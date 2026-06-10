import { cn } from "@/lib/utils";

type TaskProgressBarProps = {
  completed: number;
  total: number;
  className?: string;
  layout?: "stacked" | "inline";
};

export function TaskProgressBar({ completed, total, className, layout = "stacked" }: TaskProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const bar = (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted/70", layout === "inline" ? "w-24 shrink-0" : "h-2.5 w-full")}>
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );

  const label = (
    <p className="text-xs whitespace-nowrap text-muted-foreground">
      <span className="font-semibold text-foreground">
        {completed}/{total}
      </span>{" "}
      tasks done
    </p>
  );

  if (layout === "inline") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {bar}
        {label}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {bar}
      {label}
    </div>
  );
}
