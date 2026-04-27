import { redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorTasksList } from "@/components/vendor/tasks/vendor-tasks-list";

export default async function VendorTasksPage() {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();
  const { data: tasks } = await admin
    .from("tasks")
    .select("id, title, status, due_date, priority, description")
    .eq("wedding_id", ctx.weddingId)
    .contains("assignee_user_ids", [ctx.userId])
    .order("due_date", { ascending: true, nullsFirst: false });

  return <VendorTasksList tasks={(tasks ?? []) as Parameters<typeof VendorTasksList>[0]["tasks"]} />;
}
