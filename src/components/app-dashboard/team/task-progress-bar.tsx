import { cn } from "@/lib/utils";

type TaskProgressBarProps = {
  completed: number;
  total: number;
  className?: string;
};

export function TaskProgressBar({ completed, total, className }: TaskProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {completed}/{total}
        </span>{" "}
        tasks done
      </p>
    </div>
  );
}
