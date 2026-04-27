import { redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorEventsList } from "@/components/vendor/events/vendor-events-list";

export default async function VendorEventsPage() {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();
  const { data: events } = await admin
    .from("wedding_events")
    .select("id, title, event_date, culture_label")
    .eq("wedding_id", ctx.weddingId)
    .order("event_date", { ascending: true });

  return (
    <VendorEventsList
      events={events ?? []}
      weddingCoupleName={ctx.weddingCoupleName}
      weddingDate={ctx.weddingDate}
    />
  );
}
