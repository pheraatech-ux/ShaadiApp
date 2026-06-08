"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CULTURE_MAP, type WeddingEvent } from "../../../../weddingCultures";

type EventInfoDialogProps = {
  template: WeddingEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventInfoDialog({ template, open, onOpenChange }: EventInfoDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="gap-3 border-b border-border/70 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <DialogTitle className="text-base font-semibold">{template.name}</DialogTitle>
            <Badge variant="outline" className="rounded-md text-[10px]">
              {template.duration}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.cultures.map((cultureId) => (
              <Badge key={cultureId} variant="secondary" className="rounded-md text-[10px]">
                {CULTURE_MAP[cultureId].shortName}
              </Badge>
            ))}
          </div>
          <DialogDescription className="sr-only">
            Cultural guide for {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground">{template.description}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {template.culturalSignificance}
          </p>
          {template.requiresSpecialist && template.specialistNote ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Specialist required
              </p>
              <p className="mt-1 text-sm text-foreground/90">{template.specialistNote}</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
