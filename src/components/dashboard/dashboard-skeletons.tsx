import { Skeleton } from "@/components/ui/skeleton";

export function StatsGridSkeleton() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
          <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </section>
  );
}

export function AlertsBannerSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function WeddingListSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card py-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-xl" />
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">
        <Skeleton className="h-8 w-full rounded-xl" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-[280px] shrink-0 rounded-2xl border border-border/70 p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-border/70 pt-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UrgentTasksSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card py-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-xl" />
      </div>
      <div className="space-y-2 px-4 py-4 sm:px-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2.5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeeklyCompletionSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card py-0 shadow-sm">
      <div className="border-b border-border/70 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-5 items-end gap-2 px-4 py-4 sm:px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-3 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <StatsGridSkeleton />
      <AlertsBannerSkeleton />
      <WeddingListSkeleton />
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <UrgentTasksSkeleton />
        <WeeklyCompletionSkeleton />
      </div>
    </div>
  );
}
