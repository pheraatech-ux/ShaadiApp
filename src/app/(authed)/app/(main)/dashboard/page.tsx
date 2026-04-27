import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardContent } from "@/components/app-dashboard/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/app-dashboard/dashboard/dashboard-skeletons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const admin = getSupabaseAdminClient();
    const { data: vendorRow } = await admin
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .eq("invite_status", "active")
      .limit(1)
      .maybeSingle();
    if (vendorRow) redirect("/vendor/home");
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
