import { Skeleton } from "@/components/ui/skeleton";

export function WeddingMessagesWorkspaceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
          <Skeleton className="h-9 w-full" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className={idx % 2 === 0 ? "h-16 w-[70%]" : "ml-auto h-16 w-[70%]"} />
            ))}
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
