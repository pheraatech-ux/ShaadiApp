import { notFound } from "next/navigation";

import { WeddingVendorsWorkspace } from "@/components/wedding-workspace/vendors/wedding-vendors-workspace";
import { getWeddingVendorsWorkspaceViewBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceVendorsPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceVendorsPage({ params }: WeddingWorkspaceVendorsPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingVendorsWorkspaceViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <WeddingVendorsWorkspace view={view} />;
}
