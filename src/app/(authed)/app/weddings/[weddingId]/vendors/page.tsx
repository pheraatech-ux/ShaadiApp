import { notFound } from "next/navigation";

import { WorkspaceQuickAddForm } from "@/components/wedding-workspace/workspace-quick-add-form";
import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceVendorsPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceVendorsPage({ params }: WeddingWorkspaceVendorsPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <WorkspaceQuickAddForm
        weddingSlug={weddingId}
        kind="vendor"
        primaryLabel="Vendor name"
        secondaryLabel="Category"
        primaryPlaceholder="The Wedding Decor Studio"
        secondaryPlaceholder="Decor"
      />
      <WorkspaceSectionDataView
        title="Vendors"
        subtitle={`Vendor book for ${summary.wedding.couple_name}`}
        totalLabel={`${summary.vendors.length} vendors`}
        emptyState="No vendors yet. Add vendor records to track outreach and confirmations."
        items={summary.vendors.map((vendor) => ({
          id: vendor.id,
          primary: vendor.name,
          secondary: `${vendor.category} • ${vendor.status}`,
        }))}
      />
    </div>
  );
}
