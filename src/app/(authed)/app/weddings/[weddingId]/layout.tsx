import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WorkspaceSidebarLive } from "@/components/wedding-workspace/workspace-sidebar-live";
import { WorkspaceTopbar } from "@/components/wedding-workspace/workspace-topbar";

type WeddingWorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceLayout({ children, params }: WeddingWorkspaceLayoutProps) {
  const { weddingId } = await params;

  return (
    <DashboardShell
      sidebar={
        <Suspense>
          <WorkspaceSidebarLive weddingId={weddingId} />
        </Suspense>
      }
      topbar={<WorkspaceTopbar />}
    >
      {children}
    </DashboardShell>
  );
}
