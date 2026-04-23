"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, List, Loader2, MessageSquare, Mail } from "lucide-react";

import type { TeamMemberRow, TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";
import { WorkspaceCoupleHeader } from "@/components/wedding-workspace/overview/workspace-couple-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

type EmployeeWorkspaceTeamViewProps = {
  view: TeamPageViewModel;
};

function MemberProfileModal({ member, open, onClose }: { member: TeamMemberRow | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {member && (
          <>
            <DialogHeader>
              <DialogTitle>Team member</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              <Avatar className="size-16 border border-border/60">
                <AvatarFallback className={cn("text-base font-semibold", member.avatarClassName)}>
                  {member.avatarLabel}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">{member.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{member.subtitle}</p>
                <span className={cn("mt-1 inline-block text-xs font-medium", member.rightClassName)}>
                  {member.rightLabel}
                </span>
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
              {member.email ? (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{member.email}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contact details available.</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EmployeeWorkspaceTeamView({ view }: EmployeeWorkspaceTeamViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"cards" | "list">("list");
  const [selectedMember, setSelectedMember] = useState<TeamMemberRow | null>(null);
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null);

  const activeMembers = view.members.filter((m) => m.status !== "placeholder");

  async function handleMessage(e: React.MouseEvent, targetUserId: string) {
    e.stopPropagation();
    if (messagingUserId) return;
    setMessagingUserId(targetUserId);
    try {
      const res = await fetch(`/api/weddings/${view.weddingId}/messages/threads/dm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { thread?: { id: string } };
      const threadId = data.thread?.id;
      const href = `/app/employee/weddings/${view.weddingId}/messages${threadId ? `?thread=${threadId}` : ""}`;
      router.push(href);
    } catch {
      router.push(`/app/employee/weddings/${view.weddingId}/messages`);
    } finally {
      setMessagingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <WorkspaceCoupleHeader
          avatarLabel={view.avatarLabel}
          coupleName={view.coupleName}
          subtitleLine={view.venueLine}
          cultureTags={view.cultureTags}
        />
        <Link
          href={`/app/employee/weddings/${view.weddingId}`}
          className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 self-start rounded-xl" })}
        >
          Back to overview
        </Link>
      </section>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Team for this wedding
          </CardTitle>
          <p className="text-2xl font-semibold tabular-nums text-foreground">{view.memberCountLabel}</p>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl border-border/70">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
          <CardTitle className="text-sm">Members</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border border-border/70 p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => setViewMode("cards")}
              aria-label="Cards view"
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        </CardHeader>

        {activeMembers.length === 0 ? (
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No team members assigned to this wedding yet.
          </CardContent>
        ) : viewMode === "list" ? (
          <CardContent className="divide-y divide-border/60 p-0">
            {activeMembers.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  m.userId ? "cursor-pointer hover:bg-muted/40 transition-colors" : "",
                )}
                onClick={() => m.userId && setSelectedMember(m)}
              >
                <Avatar className="size-10 shrink-0 border border-border/60">
                  <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>
                    {m.avatarLabel}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.subtitle}</p>
                </div>
                <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
                {m.userId && m.userId !== view.currentUserId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 rounded-lg px-2"
                    disabled={messagingUserId === m.userId}
                    onClick={(e) => handleMessage(e, m.userId!)}
                  >
                    {messagingUserId === m.userId ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="size-3.5" />
                    )}
                    <span className="ml-1 text-xs">Message</span>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        ) : (
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeMembers.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-4",
                    m.userId ? "cursor-pointer hover:bg-muted/40 transition-colors" : "",
                  )}
                  onClick={() => m.userId && setSelectedMember(m)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0 border border-border/60">
                      <AvatarFallback className={cn("text-xs font-semibold", m.avatarClassName)}>
                        {m.avatarLabel}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.subtitle}</p>
                    </div>
                    <span className={cn("shrink-0 text-xs font-medium", m.rightClassName)}>{m.rightLabel}</span>
                  </div>
                  {m.userId && m.userId !== view.currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full rounded-lg"
                      disabled={messagingUserId === m.userId}
                      onClick={(e) => handleMessage(e, m.userId!)}
                    >
                      {messagingUserId === m.userId ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="size-3.5" />
                      )}
                      <span className="ml-1 text-xs">Message</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <MemberProfileModal
        member={selectedMember}
        open={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
