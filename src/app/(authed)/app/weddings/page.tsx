import { redirect } from "next/navigation";

import { getWeddingSlugList } from "@/lib/data/app-data";

export default async function WeddingsPage() {
  const weddingSlugs = await getWeddingSlugList();
  const firstWeddingId = weddingSlugs[0];

  if (!firstWeddingId) {
    redirect("/app/dashboard");
  }

  redirect(`/app/weddings/${firstWeddingId}`);
}
