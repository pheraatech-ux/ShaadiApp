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
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
        "transition-all duration-200 ease-out",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.07),_0_10px_28px_rgba(0,0,0,0.09)]",
        "hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Subtle top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-border/60 transition-opacity duration-200 group-hover:opacity-100" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
        {title}
      </p>
      <p className="db-count-in mt-2.5 text-[2rem] leading-none font-bold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground/80">{helperText}</p>

      {typeof progress === "number" ? (
        <div className="mt-4 space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-foreground/60 to-foreground transition-all duration-700 ease-out"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
          <p className="text-[10px] tabular-nums text-muted-foreground/60">{progress}% complete</p>
        </div>
      ) : null}
    </article>
  );
}
