import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";
import { cn } from "@/lib/utils";

type VendorsNeededPanelProps = {
  workspace: WeddingWorkspaceViewModel;
};

const urgencyDot: Record<
  WeddingWorkspaceViewModel["vendorsNeeded"][number]["urgency"],
  string
> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-muted-foreground/50",
};

export function VendorsNeededPanel({ workspace }: VendorsNeededPanelProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Vendors needed</h2>
        <Button variant="link" size="sm" className="h-auto px-1 text-xs text-primary">
          Add vendor
        </Button>
      </header>
      <div className="divide-y divide-border/60">
        {workspace.vendorsNeeded.map((vendor) => (
          <article key={vendor.id} className="flex gap-3 px-4 py-3">
            <span
              className={cn("mt-1.5 size-2 shrink-0 rounded-full", urgencyDot[vendor.urgency])}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {vendor.displayTitle ?? `${vendor.name} (${vendor.role})`}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {vendor.contextLine ?? vendor.note}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{vendor.statusLabel}</span>
          </article>
        ))}
      </div>
      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/70 px-4 py-2.5">
        <Button variant="link" size="sm" className="h-auto gap-0.5 px-0 text-xs text-primary">
          <Plus className="size-3.5" />
          Add vendor
        </Button>
        <Button variant="link" size="sm" className="h-auto gap-0.5 px-0 text-xs text-primary">
          AI vendor research
          <ArrowRight className="size-3.5" />
        </Button>
      </footer>
    </section>
  );
}
