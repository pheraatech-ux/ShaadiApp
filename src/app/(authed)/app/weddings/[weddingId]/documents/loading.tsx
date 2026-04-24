export default function WeddingWorkspaceDocumentsLoading() {
  return (
    <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-md bg-muted/50" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
          <div className="h-3.5 w-40 animate-pulse rounded-md bg-muted/30" />
        </div>

        {/* Toolbar skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            {[100, 120, 130, 150].map((w, i) => (
              <div key={i} className="h-9 animate-pulse rounded-xl bg-muted/40" style={{ width: w }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 animate-pulse rounded-xl bg-muted/40" />
            <div className="h-9 w-28 animate-pulse rounded-xl bg-muted/40" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Header row */}
          <div className="hidden h-12 animate-pulse border-b border-border/60 bg-muted/20 md:block" />

          {/* Rows */}
          <div className="divide-y divide-border/50">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted/50" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-muted/40" />
                </div>
                <div className="hidden h-6 w-28 animate-pulse rounded-full bg-muted/40 md:block" />
                <div className="hidden h-8 w-28 animate-pulse rounded-lg bg-muted/30 md:block" />
                <div className="hidden h-4 w-20 animate-pulse rounded bg-muted/40 md:block" />
                <div className="hidden h-4 w-14 animate-pulse rounded bg-muted/40 md:block" />
                <div className="size-8 shrink-0 animate-pulse rounded-lg bg-muted/30" />
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
