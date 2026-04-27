import { redirect } from "next/navigation";
import { type ReactNode } from "react";

import { getVendorPortalContext } from "@/lib/vendor/context";

export default async function VendorRootLayout({ children }: { children: ReactNode }) {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");
  return <>{children}</>;
}
