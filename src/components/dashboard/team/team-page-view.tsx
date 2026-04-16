"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppPageHeader } from "@/components/dashboard/app-page-header";
import { TeamAlertBanner } from "@/components/dashboard/team/team-alert-banner";
import { TeamMembersTable } from "@/components/dashboard/team/team-members-table";
import { TeamSummaryCards } from "@/components/dashboard/team/team-summary-cards";
import { TeamListPageViewModel } from "@/components/dashboard/team/team-types";
import { InviteTeamMemberDialog } from "@/components/wedding-workspace/team/invite-team-member-dialog";
import { Button } from "@/components/ui/button";

type TeamPageViewProps = {
  view: TeamListPageViewModel;
};

export function TeamPageView({ view }: TeamPageViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-5">
      <AppPageHeader
        title="Teams"
        description={view.workspaceLabel}
        actions={
          <Button size="sm" className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => setInviteOpen(true)}>
            + Invite team
          </Button>
        }
      />
      <TeamSummaryCards cards={view.kpis} />
      <TeamAlertBanner message={view.alertText} />
      <TeamMembersTable members={view.members} onInviteClick={() => setInviteOpen(true)} />
      <InviteTeamMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        description="They'll get a WhatsApp invite to join your company workspace. This adds them as an employee, not to a specific wedding."
        roleSectionLabel="Role in this business"
        infoText="Invite sent via WhatsApp. Employees are added to your company team and can be assigned to weddings later."
        onSubmit={async ({ name, phone, email, role }) => {
          const response = await fetch("/api/team/employees", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, role }),
          });
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to invite team member.");
          }
          router.refresh();
        }}
      />
    </div>
  );
}
