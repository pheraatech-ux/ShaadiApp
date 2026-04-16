import { Mail, Phone } from "lucide-react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import { formatInrFromPaise, inviteStatusLabel, vendorStatusLabel } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VendorCardProps = {
  vendor: WeddingVendorRecord;
  onEdit: (vendor: WeddingVendorRecord) => void;
  onInvite: (vendor: WeddingVendorRecord) => void;
};

export function VendorCard({ vendor, onEdit, onInvite }: VendorCardProps) {
  return (
    <Card className="border-border/70">
      <CardContent className="space-y-6 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xl font-semibold tracking-tight">{vendor.name}</p>
            <p className="text-sm text-muted-foreground">{vendor.category}</p>
          </div>
          <Badge
            className={cn(
              "border",
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

        <div className="grid gap-2 text-sm text-muted-foreground">
          {vendor.phone ? (
            <p className="inline-flex items-center gap-2">
              <Phone className="size-4" />
              {vendor.phone}
            </p>
          ) : null}
          {vendor.email ? (
            <p className="inline-flex items-center gap-2">
              <Mail className="size-4" />
              {vendor.email}
            </p>
          ) : null}
          {vendor.instagramHandle ? <p>📸 {vendor.instagramHandle}</p> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Quoted total</p>
            <p className="text-2xl font-semibold">{formatInrFromPaise(vendor.quotedPricePaise)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Advance paid</p>
            <p className="text-2xl font-semibold text-amber-300">{formatInrFromPaise(vendor.advancePaidPaise)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="rounded-md border-violet-500/40 bg-violet-500/10 text-violet-300" variant="outline">
            {inviteStatusLabel(vendor.inviteStatus)}
          </Badge>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => onEdit(vendor)}>
              Edit
            </Button>
            <Button type="button" size="sm" className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-600/90" onClick={() => onInvite(vendor)}>
              {vendor.inviteStatus === "not_sent" ? "Invite to portal" : "Resend"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
