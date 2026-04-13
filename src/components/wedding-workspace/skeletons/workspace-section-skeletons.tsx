import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSectionListSkeleton({ showQuickAdd = true }: { showQuickAdd?: boolean }) {
  return (
    <div className="space-y-4" aria-hidden>
      {showQuickAdd ? (
        <section className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="flex items-end">
              <Skeleton className="h-9 w-16 rounded-xl" />
            </div>
          </div>
        </section>
      ) : null}

      <div className="space-y-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <section className="rounded-xl border border-border/70 bg-card">
        <div className="border-b border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1 px-4 py-3">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-44 max-w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WorkspaceTeamPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="ml-auto h-8 w-12" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-card p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/60 px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid gap-3 px-4 py-3 xl:grid-cols-[1.2fr_1fr_auto_auto] xl:items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-[150px] rounded-lg" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WorkspaceTasksPageSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <section className="rounded-xl border border-border/70 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-8 w-64 max-w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-card p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-lg" />
          ))}
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto_auto]">
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-[170px] rounded-xl" />
          <Skeleton className="h-9 w-[170px] rounded-xl" />
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-7 rounded-full" />
            </div>
            {Array.from({ length: 3 }).map((_, taskIndex) => (
              <div key={taskIndex} className="space-y-2 rounded-lg border border-border/60 p-3">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
