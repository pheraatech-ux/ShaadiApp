import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getCultureBadgeClassName,
  getCultureBadgeClassNameFromTone,
} from "@/components/wedding-workspace/overview/workspace-culture-styles";
import { cn } from "@/lib/utils";

/** Team mock uses explicit tones; overview uses label-only (Punjabi / Tamil matched by name). */
export type WorkspaceCoupleCultureTag =
  | { label: string; tone: "punjabi" | "tamil" }
  | { label: string };

type WorkspaceCoupleHeaderProps = {
  avatarLabel: string;
  coupleName: string;
  subtitleLine: string;
  cultureTags: WorkspaceCoupleCultureTag[];
};

function resolveTagClass(tag: WorkspaceCoupleCultureTag) {
  if ("tone" in tag && tag.tone) {
    return getCultureBadgeClassNameFromTone(tag.tone);
  }
  return getCultureBadgeClassName(tag.label);
}

/**
 * Shared couple heading: avatar, name, culture pills, one subtitle line — same layout on Team and Overview.
 */
export function WorkspaceCoupleHeader({
  avatarLabel,
  coupleName,
  subtitleLine,
  cultureTags,
}: WorkspaceCoupleHeaderProps) {
  return (
    <div className="flex min-w-0 gap-3">
      <Avatar className="size-12 rounded-full border border-border/70">
        <AvatarFallback className="rounded-full bg-muted text-sm font-semibold">{avatarLabel}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{coupleName}</h1>
          {cultureTags.map((t) => (
            <Badge key={t.label} variant="outline" className={cn(resolveTagClass(t))}>
              {t.label}
            </Badge>
          ))}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitleLine}</p>
      </div>
    </div>
  );
}
