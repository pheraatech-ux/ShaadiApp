import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  WorkspaceSidebarSkeleton,
  WorkspaceTopbarSkeleton,
} from "@/components/wedding-workspace/skeletons";
import { WorkspaceSidebarLive } from "@/components/wedding-workspace/overview/workspace-sidebar-live";
import { WorkspaceTopbar } from "@/components/wedding-workspace/overview/workspace-topbar";
import { WeddingChatWidget } from "@/components/wedding-workspace/ai-chat/wedding-chat-widget";
import { hasPendingWelcome, needsPlannerOnboarding } from "@/lib/auth/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type WeddingWorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceLayout({ children, params }: WeddingWorkspaceLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/app");
  }

  if (needsPlannerOnboarding(user)) {
    redirect("/app/onboarding");
  }

  if (hasPendingWelcome(user)) {
    redirect("/app/welcome");
  }

  const { weddingId } = await params;

  return (
    <>
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
      <WeddingChatWidget weddingSlug={weddingId} />
    </>
  );
}
