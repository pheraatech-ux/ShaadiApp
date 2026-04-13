import { AppPageHeader } from "@/components/dashboard/app-page-header";
import { getAppSidebarCounts } from "@/lib/data/app-data";

export default async function MessagesPage() {
  const counts = await getAppSidebarCounts();

  return (
    <div className="space-y-5">
      <AppPageHeader title="Messages" />
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
  );
}
