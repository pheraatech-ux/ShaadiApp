import Link from "next/link";
import { Calendar } from "lucide-react";

import { TeamMemberProfileViewModel } from "@/components/app-dashboard/team/team-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MemberProfileHeaderProps = {
  view: TeamMemberProfileViewModel;
  showBackLink?: boolean;
  compact?: boolean;
  teamBackHref?: string;
};

function MemberSinceBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
      <Calendar className="size-3 shrink-0 opacity-70" aria-hidden />
      {label}
    </Badge>
  );
}

export function MemberProfileHeader({
  view,
  showBackLink = true,
  compact = false,
  teamBackHref = "/app/team",
}: MemberProfileHeaderProps) {
  const memberSinceLabel = view.member.memberSinceLabel;

  return (
    <Card className="rounded-2xl border-border/70 py-0">
      <CardContent
        className={cn(
          "flex items-center justify-between gap-3",
          compact ? "px-4 py-4" : "flex-col gap-4 p-4 sm:flex-row sm:items-center",
        )}
      >
        <div className={cn("flex min-w-0 items-center gap-3", compact && "flex-1")}>
          <Avatar className={cn("shrink-0 border border-border/70", compact ? "size-10" : "size-12")}>
            <AvatarFallback className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>
              {view.member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className={cn("truncate font-semibold", compact ? "text-sm" : "text-base")}>{view.member.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {view.member.roleLabel} • {view.member.email}
            </p>
            {!compact && memberSinceLabel ? (
              <div className="mt-1.5">
                <MemberSinceBadge label={memberSinceLabel} />
              </div>
            ) : null}
          </div>
        </div>
        {compact && memberSinceLabel ? (
          <MemberSinceBadge label={memberSinceLabel} />
        ) : null}
        {showBackLink ? (
          <Link href={teamBackHref}>
            <Button variant="outline" size="sm" className="rounded-lg">
              Back to team
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
