import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  helperText: string;
  progress?: number;
  className?: string;
};

export function StatCard({ title, value, helperText, progress, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      {typeof progress === "number" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}
