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
  const [inviteFeedback, setInviteFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

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
    setInviteFeedback({
      tone: "success",
      message:
        intent === "copy"
          ? copied
            ? "Invite link copied."
            : "Invite link ready."
          : copied
            ? "New invite link generated, old links are now invalid."
            : "New invite link generated.",
    });
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
      {inviteFeedback ? (
        <p
          className={
            inviteFeedback.tone === "success"
              ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
              : "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {inviteFeedback.message}
        </p>
      ) : null}
      <TeamMembersTable
        members={view.members}
        onInviteClick={() => setInviteOpen(true)}
        onCopyInviteLink={async (memberId) => {
          try {
            await handleInviteLink(memberId, "copy");
          } catch (error) {
            setInviteFeedback({
              tone: "error",
              message: error instanceof Error ? error.message : "Unable to copy invite link.",
            });
          }
        }}
        onGenerateNewInviteLink={async (memberId) => {
          try {
            await handleInviteLink(memberId, "new-link");
          } catch (error) {
            setInviteFeedback({
              tone: "error",
              message: error instanceof Error ? error.message : "Unable to generate new link.",
            });
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
          setInviteFeedback(null);
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
            setInviteFeedback({
              tone: "success",
              message: copied ? "Invite created. Unique link copied to clipboard." : "Invite created. Unique link generated.",
            });
          }
          router.refresh();
        }}
      />
    </div>
  );
}
