"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";

import { InviteTeamMemberDialog } from "@/components/wedding-workspace/team/invite-team-member-dialog";
import type { TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";
import { WorkspaceCoupleHeader } from "@/components/wedding-workspace/workspace-couple-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
type WorkspaceTeamViewProps = {
  view: TeamPageViewModel;
  defaultInviteOpen?: boolean;
};

export function WorkspaceTeamView({ view, defaultInviteOpen = false }: WorkspaceTeamViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(defaultInviteOpen);
  const clearedInviteQuery = useRef(false);

  useEffect(() => {
    if (!defaultInviteOpen || clearedInviteQuery.current) return;
    clearedInviteQuery.current = true;
    setInviteOpen(true);
    router.replace(`/app/weddings/${view.weddingId}/team`, { scroll: false });
  }, [defaultInviteOpen, router, view.weddingId]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <WorkspaceCoupleHeader
          avatarLabel={view.avatarLabel}
          coupleName={view.coupleName}
          subtitleLine={view.venueLine}
          cultureTags={view.cultureTags}
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={`/app/weddings/${view.weddingId}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 rounded-xl" })}
          >
            Back to overview
          </Link>
          <Button size="sm" className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => setInviteOpen(true)}>
            + Invite member
          </Button>
        </div>
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Team for this wedding</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-pretty">{view.summaryDescription}</CardDescription>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-semibold tabular-nums text-foreground">{view.memberCountLabel}</p>
            <p className="text-xs text-muted-foreground">members</p>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border/60 p-0">
          {view.members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              {m.status === "placeholder" ? (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50">
                  <UserPlus className="size-4 text-muted-foreground" />
                </span>
              ) : (
                <Avatar className="size-10 shrink-0 border border-border/60">
                  <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>{m.avatarLabel}</AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
              </div>
              {m.status === "placeholder" ? (
                <Button variant="outline" size="sm" className="h-8 shrink-0 rounded-lg" onClick={() => setInviteOpen(true)}>
                  {m.rightLabel}
                </Button>
              ) : (
                <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">About team access on the free plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Invites are sent via WhatsApp with a wedding-specific link. Members only see this wedding — not your other
            clients.
          </p>
          <p>
            Upgrading to{" "}
            <strong className="font-semibold text-foreground">ShaadiOS Pro (₹2,499)</strong> removes the 3-member limit
            across all weddings.
          </p>
        </CardContent>
      </Card>

      <InviteTeamMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
