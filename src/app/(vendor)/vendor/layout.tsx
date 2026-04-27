import { type ReactNode } from "react";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorShell } from "@/components/vendor/vendor-shell";

async function getProfileName(userId: string) {
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  const full = [data?.first_name?.trim(), data?.last_name?.trim()].filter(Boolean).join(" ");
  return full || "Vendor";
}

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const ctx = await getVendorPortalContext();
  if (!ctx) return null;

  const userName = await getProfileName(ctx.userId);

  return (
    <VendorShell
      userName={userName}
      userEmail={ctx.userEmail ?? ""}
      vendorName={ctx.vendorName}
      topbarTitle={ctx.vendorName}
    >
      {children}
    </VendorShell>
  );
}
