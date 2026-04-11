import { redirect } from "next/navigation";

import { dashboardMockData } from "@/components/dashboard/mock-data";

export default function WeddingsPage() {
  const firstWeddingId = dashboardMockData.weddings[0]?.id;

  if (!firstWeddingId) {
    redirect("/app/dashboard");
  }

  redirect(`/app/weddings/${firstWeddingId}`);
}
