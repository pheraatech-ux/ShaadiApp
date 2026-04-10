import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardAlert } from "@/components/dashboard/types";

type AlertsBannerProps = {
  alerts: DashboardAlert[];
};

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  if (!alerts.length) {
    return null;
  }

  return (
    <section className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-foreground">{alert.message}</p>
          </div>
          {alert.ctaLabel ? (
            <Button size="sm" variant="outline" className="rounded-xl">
              {alert.ctaLabel}
            </Button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
