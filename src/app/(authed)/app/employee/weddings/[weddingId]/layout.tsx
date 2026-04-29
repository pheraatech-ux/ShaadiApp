import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  WorkspaceSidebarSkeleton,
  WorkspaceTopbarSkeleton,
} from "@/components/wedding-workspace/skeletons";
import { WorkspaceSidebarLive } from "@/components/wedding-workspace/overview/workspace-sidebar-live";
import { WorkspaceTopbar } from "@/components/wedding-workspace/overview/workspace-topbar";
import { WeddingChatWidget } from "@/components/wedding-workspace/ai-chat/wedding-chat-widget";

type EmployeeWeddingLayoutProps = {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
};

export default async function EmployeeWeddingLayout({ children, params }: EmployeeWeddingLayoutProps) {
  const { weddingId } = await params;

  return (
    <>
      <DashboardShell
        sidebar={
          <Suspense fallback={<WorkspaceSidebarSkeleton />}>
            <WorkspaceSidebarLive weddingId={weddingId} appRoot="/app/employee" />
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
      <WeddingChatWidget weddingSlug={weddingId} />
    </>
  );
}
