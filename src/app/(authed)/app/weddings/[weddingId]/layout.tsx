import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  WorkspaceSidebarSkeleton,
  WorkspaceTopbarSkeleton,
} from "@/components/wedding-workspace/skeletons";
import { WorkspaceSidebarLive } from "@/components/wedding-workspace/overview/workspace-sidebar-live";
import { WorkspaceTopbar } from "@/components/wedding-workspace/overview/workspace-topbar";

type WeddingWorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceLayout({ children, params }: WeddingWorkspaceLayoutProps) {
  const { weddingId } = await params;

  return (
    <DashboardShell
      sidebar={
        <Suspense fallback={<WorkspaceSidebarSkeleton />}>
          <WorkspaceSidebarLive weddingId={weddingId} />
        </Suspense>
      }
      topbar={
        <Suspense fallback={<WorkspaceTopbarSkeleton />}>
          <WorkspaceTopbar />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}
