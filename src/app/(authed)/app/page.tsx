import { redirect } from "next/navigation";

import { getCurrentPersona } from "@/lib/employee/persona";
import { hasPendingWelcome, needsPlannerOnboarding } from "@/lib/auth/onboarding";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppIndexPage() {
  const { persona, userId } = await getCurrentPersona();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (persona === "vendor") redirect("/vendor/home");
  if (persona === "employee") redirect("/app/employee/dashboard");
  if (user && needsPlannerOnboarding(user)) redirect("/app/onboarding");
  if (user && hasPendingWelcome(user)) redirect("/app/welcome");

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
