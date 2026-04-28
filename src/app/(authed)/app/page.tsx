import { redirect } from "next/navigation";

import { getCurrentPersona } from "@/lib/employee/persona";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AppIndexPage() {
  const { persona, userId } = await getCurrentPersona();

  if (persona === "vendor") redirect("/vendor/home");
  if (persona === "employee") redirect("/app/employee/dashboard");

  // Backfill: vendors who claimed their invite before JWT persona was introduced
  // won't have app_metadata set yet. Detect them via DB, write the persona, then redirect.
  if (userId) {
    const admin = getSupabaseAdminClient();
    const { data: vendorRow } = await admin
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .eq("invite_status", "active")
      .limit(1)
      .maybeSingle();
    if (vendorRow) {
      await admin.auth.admin.updateUserById(userId, { app_metadata: { persona: "vendor" } });
      redirect("/vendor/home");
    }
  }

  redirect("/app/dashboard");
}
