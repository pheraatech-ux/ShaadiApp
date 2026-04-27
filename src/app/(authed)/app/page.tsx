import { redirect } from "next/navigation";

import { getCurrentPersona } from "@/lib/employee/persona";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AppIndexPage() {
  const { persona, userId } = await getCurrentPersona();

  if (userId) {
    // Check if user is an active vendor — redirect to vendor portal
    const admin = getSupabaseAdminClient();
    const { data: vendorRow } = await admin
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .eq("invite_status", "active")
      .limit(1)
      .maybeSingle();
    if (vendorRow) redirect("/vendor/home");
  }

  if (persona === "employee") {
    redirect("/app/employee/dashboard");
  }
  redirect("/app/dashboard");
}
