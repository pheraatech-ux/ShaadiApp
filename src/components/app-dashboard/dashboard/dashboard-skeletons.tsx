import { Skeleton } from "@/components/ui/skeleton";

function GreetingBarSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-16">
      <div className="shrink-0 space-y-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-9 w-36 sm:h-10" />
        <Skeleton className="h-3.5 w-28" />
      </div>
      <div className="flex flex-1 divide-x divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center px-4 py-3">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-2 h-7 w-10" />
            <Skeleton className="mt-1 h-2.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-card shadow-sm ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-16 rounded-xl" />
      </div>
      <div className="space-y-2 px-4 py-4 sm:px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2.5">
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <GreetingBarSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelSkeleton className="h-[400px]" />
        <PanelSkeleton className="h-[400px]" />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <PanelSkeleton className="h-[340px]" />
        <PanelSkeleton className="h-[340px]" />
      </div>
    </div>
  );
}

export function EmployeeDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <GreetingBarSkeleton />
      <div className="grid h-[380px] items-stretch gap-4 lg:grid-cols-2">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  );
}

/** Matches app sidebar width (16rem) so the shell does not jump while data loads. */
export function SidebarChromeSkeleton() {
  return (
    <div className="group peer hidden text-sidebar-foreground md:block" aria-hidden>
      <div className="relative w-64 bg-transparent" />
      <div className="fixed inset-y-0 left-0 z-10 hidden h-svh w-64 md:flex">
        <div className="flex size-full flex-col border-r border-sidebar-border bg-sidebar">
          <div className="shrink-0 border-b border-sidebar-border/60 px-2 py-3 sm:px-3">
            <Skeleton className="h-[39px] w-full rounded-xl" />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-3">
            <div className="space-y-1.5 px-1">
              <Skeleton className="h-3 w-20" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
            <div className="mt-auto border-t border-sidebar-border pt-3">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTopbarSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-7 w-48 sm:h-8" />
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="hidden h-9 max-w-sm flex-1 rounded-xl sm:block sm:w-64" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="size-9 rounded-xl" />
      </div>
    </div>
  );
}
