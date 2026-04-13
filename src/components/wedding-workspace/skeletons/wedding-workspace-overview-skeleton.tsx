import { Skeleton } from "@/components/ui/skeleton";

export function WeddingWorkspaceOverviewSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-10 w-full rounded-xl" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <Skeleton className="h-4 w-28" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <Skeleton className="h-4 w-36" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
