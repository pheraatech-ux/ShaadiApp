import { AllWeddingsPage } from "@/components/app-dashboard/all-weddings/all-weddings-page";
import { getAllWeddingsPageView } from "@/lib/data/app-data";

export default async function EmployeeWeddingsPage() {
  const view = await getAllWeddingsPageView();
  return <AllWeddingsPage initialData={view} basePath="/app/employee" canCreateWedding={false} />;
}
