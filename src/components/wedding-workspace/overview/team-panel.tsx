import { Info, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";
import { cn } from "@/lib/utils";

type TeamPanelProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function TeamPanel({ workspace }: TeamPanelProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Team</h2>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
          Manage
        </Button>
      </header>
      <div className="space-y-2 p-3">
        {workspace.teamMembers.length === 0 ? (
          <p className="rounded-lg border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            No team members assigned yet.
          </p>
        ) : (
          workspace.teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9 border border-border/70">
                  <AvatarFallback className="text-xs font-semibold">{member.avatarLabel}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.subtitle}</p>
                </div>
              </div>
              {member.badge ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {member.badge}
                </Badge>
              ) : null}
            </div>
          ))
        )}
        {workspace.teamInvites.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border border-dashed border-border/80 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-muted/40",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
              <UserPlus className="size-4 text-muted-foreground" />
            </span>
            <span className="text-sm text-muted-foreground">{slot.label}</span>
          </button>
        ))}
      </div>
      <footer className="flex items-start gap-2 border-t border-border/70 px-4 py-3">
        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-snug text-muted-foreground">{workspace.teamFooterNote}</p>
      </footer>
    </section>
  );
}
