import { AllWeddingsPage } from "@/components/all-weddings/all-weddings-page";
import { getAllWeddingsPageView } from "@/lib/data/app-data";

export default async function WeddingsPage() {
  const view = await getAllWeddingsPageView();

  return <AllWeddingsPage initialData={view} />;
}
