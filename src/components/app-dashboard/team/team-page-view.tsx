"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppPageHeader } from "@/components/app-dashboard/dashboard/app-page-header";
import { TeamAlertBanner } from "@/components/app-dashboard/team/team-alert-banner";
import { TeamMembersTable } from "@/components/app-dashboard/team/team-members-table";
import { TeamSummaryCards } from "@/components/app-dashboard/team/team-summary-cards";
import { TeamListPageViewModel } from "@/components/app-dashboard/team/team-types";
import { InviteTeamMemberDialog } from "@/components/wedding-workspace/team/invite-team-member-dialog";
import { Button } from "@/components/ui/button";

type TeamPageViewProps = {
  view: TeamListPageViewModel;
};

export function TeamPageView({ view }: TeamPageViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);

  async function copyTextToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function handleInviteLink(memberId: string, intent: "copy" | "new-link") {
    const response = await fetch(`/api/team/employees/${memberId}/invite-link`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate: intent === "new-link" }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; inviteUrl?: string };
    if (!response.ok || !payload.inviteUrl) {
      throw new Error(payload.error ?? "Unable to refresh invite link.");
    }
    const copied = await copyTextToClipboard(payload.inviteUrl);
    if (intent === "copy") {
      toast(copied ? "Invite link copied" : "Invite link ready");
      router.refresh();
      return;
    }
    toast(
      copied ? "New invite link generated, old links are now invalid." : "New invite link generated.",
    );
    router.refresh();
  }

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
      <TeamMembersTable
        members={view.members}
        currentUserId={view.currentUserId}
        onInviteClick={() => setInviteOpen(true)}
        onMessageMember={async (memberId) => {
          const response = await fetch(`/api/team/employees/${memberId}/message`, {
            method: "POST",
            credentials: "include",
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string; threadId?: string; weddingSlug?: string };
          if (!response.ok || !data.threadId || !data.weddingSlug) {
            toast.error(data.error ?? "Unable to start conversation.");
            return;
          }
          router.push(`/app/weddings/${data.weddingSlug}/messages?thread=${data.threadId}`);
        }}
        onCopyInviteLink={async (memberId) => {
          try {
            await handleInviteLink(memberId, "copy");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to copy invite link.");
          }
        }}
        onGenerateNewInviteLink={async (memberId) => {
          try {
            await handleInviteLink(memberId, "new-link");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to generate new link.");
          }
        }}
        onDeleteMember={async (memberId) => {
          try {
            const response = await fetch(`/api/team/employees/${memberId}`, {
              method: "DELETE",
              credentials: "include",
            });
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            if (!response.ok) {
              throw new Error(payload.error ?? "Unable to remove team member.");
            }
            toast("Team member removed.");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to remove team member.");
          }
        }}
      />
      <InviteTeamMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        description="Create a secure invite link to add this person to your company workspace. This adds them as an employee, not to a specific wedding."
        roleSectionLabel="Role in this business"
        infoText="A secure invite link is generated and copied. Employees are added to your company team and can be assigned to weddings later."
        submitLabel="Create invite link"
        onSubmit={async ({ name, phone, email, role }) => {
          const response = await fetch("/api/team/employees", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, role }),
          });
          const payload = (await response.json().catch(() => ({}))) as { error?: string; inviteUrl?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to invite team member.");
          }
          if (payload.inviteUrl) {
            const copied = await copyTextToClipboard(payload.inviteUrl);
            toast(
              copied ? "Invite created. Unique link copied to clipboard." : "Invite created. Unique link generated.",
            );
          }
          router.refresh();
        }}
      />
    </div>
  );
}
