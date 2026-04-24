import { AtSign, Mail, Phone } from "lucide-react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import { formatInrFromPaise, inviteStatusLabel, vendorStatusLabel } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VendorCardProps = {
  vendor: WeddingVendorRecord;
  onOpen: (vendor: WeddingVendorRecord) => void;
};

export function VendorCard({ vendor, onOpen }: VendorCardProps) {
  return (
    <Card
      className="cursor-pointer border-border/70 py-0 transition-all hover:border-border hover:shadow-md"
      onClick={() => onOpen(vendor)}
    >
      <CardContent className="space-y-2 px-3 py-2.5">
        {/* Name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight">{vendor.name}</p>
            <p className="text-sm text-muted-foreground">{vendor.category}</p>
          </div>
          <Badge
            className={cn(
              "shrink-0 border text-xs",
              vendor.status === "confirmed"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : vendor.status === "declined"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-violet-500/40 bg-violet-500/10 text-violet-300",
            )}
            variant="outline"
          >
            {vendorStatusLabel(vendor.status)}
          </Badge>
        </div>

        {/* Contact */}
        <div className="space-y-0.5 text-sm text-muted-foreground">
          <p className="flex min-w-0 items-center gap-1.5">
            <Phone className="size-3.5 shrink-0" />
            {vendor.phone
              ? <span className="min-w-0 truncate">{vendor.phone}</span>
              : <span className="italic text-muted-foreground/50">not added</span>}
          </p>
          <p className="flex min-w-0 items-center gap-1.5">
            <Mail className="size-3.5 shrink-0" />
            {vendor.email
              ? <span className="min-w-0 truncate">{vendor.email}</span>
              : <span className="italic text-muted-foreground/50">not added</span>}
          </p>
          <p className="flex min-w-0 items-center gap-1.5 truncate">
            <AtSign className="size-3.5 shrink-0" />
            {vendor.instagramHandle
              ? vendor.instagramHandle
              : <span className="italic text-muted-foreground/50">not added</span>}
          </p>
        </div>

        {/* Prices */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Quoted</p>
            <p className="text-lg font-semibold">{formatInrFromPaise(vendor.quotedPricePaise)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Advance</p>
            <p className="text-lg font-semibold text-amber-300">{formatInrFromPaise(vendor.advancePaidPaise)}</p>
          </div>
        </div>

        {/* Invite status */}
        <Badge className="rounded-md border-violet-500/40 bg-violet-500/10 text-xs text-violet-300" variant="outline">
          {inviteStatusLabel(vendor.inviteStatus)}
        </Badge>
      </CardContent>
    </Card>
  );
}
