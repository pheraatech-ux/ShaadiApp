import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";
import { getAppSidebarCounts } from "@/lib/data/app-data";

export default async function MessagesPage() {
  const counts = await getAppSidebarCounts();

  return (
    <DashboardShell
      sidebar={
        <Suspense>
          <SidebarLive currentPath="/app/messages" />
        </Suspense>
      }
      topbar={
        <Suspense>
          <DashboardTopbarLive />
        </Suspense>
      }
    >
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        <section className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Total messages across accessible weddings.
          </p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{counts.messages}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Messages are stored per wedding workspace.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
