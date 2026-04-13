import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the desktop sidebar chrome so workspace route transitions do not jump. */
export function WorkspaceSidebarSkeleton() {
  return (
    <div className="group peer hidden text-sidebar-foreground md:block" aria-hidden>
      <div className="relative w-64 bg-transparent" />
      <div className="fixed inset-y-0 left-0 z-10 hidden h-svh w-64 md:flex">
        <div className="flex size-full flex-col border-r border-sidebar-border bg-sidebar">
          <div className="shrink-0 border-b border-sidebar-border/60 px-2 py-3 sm:px-3">
            <Skeleton className="h-[39px] w-full rounded-xl" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-2">
            <div className="space-y-1 px-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-1 px-1">
              <Skeleton className="h-3 w-20" />
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-1 px-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-12 w-full rounded-lg" />
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

export function WorkspaceTopbarSkeleton() {
  return (
    <div className="flex min-h-9 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-hidden>
      <Skeleton className="h-9 w-28 rounded-xl" />
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="size-9 rounded-xl" />
      </div>
    </div>
  );
}
