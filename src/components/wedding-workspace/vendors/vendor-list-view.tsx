"use client";

import { AtSign, ChevronRight, Mail, Phone } from "lucide-react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import {
  formatInrFromPaise,
  inviteStatusLabel,
  toMailtoHref,
  toTelHref,
  vendorStatusLabel,
} from "@/components/wedding-workspace/vendors/vendor-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VendorListViewProps = {
  vendors: WeddingVendorRecord[];
  onOpen: (vendor: WeddingVendorRecord) => void;
};

function statusBadgeClassName(status: WeddingVendorRecord["status"]) {
  if (status === "confirmed") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (status === "declined") return "border-destructive/40 bg-destructive/10 text-destructive";
  return "border-violet-500/40 bg-violet-500/10 text-violet-300";
}

export function VendorListView({ vendors, onOpen }: VendorListViewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <header className="hidden grid-cols-[minmax(0,2fr)_minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.1fr)_auto] items-center gap-3 border-b border-border/60 px-4 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
        <span>Vendor</span>
        <span>Status</span>
        <span>Contact</span>
        <span>Quoted</span>
        <span>Advance</span>
        <span>Invite</span>
        <span />
      </header>

      <div className="divide-y divide-border/60">
        {vendors.map((vendor) => (
          <article
            key={vendor.id}
            onClick={() => onOpen(vendor)}
            className="grid cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-muted/20 md:grid-cols-[minmax(0,2fr)_minmax(0,0.95fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.1fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{vendor.name}</p>
              <p className="truncate text-xs text-muted-foreground">{vendor.category}</p>
              {vendor.instagramHandle ? (
                <p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                <AtSign className="size-3 shrink-0" />{vendor.instagramHandle}
              </p>
              ) : null}
            </div>

            <div>
              <Badge className={cn("border text-[10px]", statusBadgeClassName(vendor.status))} variant="outline">
                {vendorStatusLabel(vendor.status)}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              {vendor.phone ? (
                <p className="flex min-w-0 items-center gap-1.5">
                  <Phone className="size-3.5 shrink-0" />
                  <a
                    href={toTelHref(vendor.phone)}
                    className="min-w-0 truncate underline-offset-2 transition-colors hover:text-primary hover:underline"
                  >
                    {vendor.phone}
                  </a>
                </p>
              ) : null}
              {vendor.email ? (
                <p className="flex min-w-0 items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" />
                  <a
                    href={toMailtoHref(vendor.email)}
                    className="min-w-0 truncate underline-offset-2 transition-colors hover:text-primary hover:underline"
                  >
                    {vendor.email}
                  </a>
                </p>
              ) : null}
              {!vendor.phone && !vendor.email ? <span className="text-muted-foreground/70">—</span> : null}
            </div>

            <div className="text-xs">
              <p className="font-semibold text-foreground">{formatInrFromPaise(vendor.quotedPricePaise)}</p>
              <p className="text-muted-foreground md:hidden">Quoted</p>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-amber-300">{formatInrFromPaise(vendor.advancePaidPaise)}</p>
              <p className="text-muted-foreground md:hidden">Advance</p>
            </div>

            <div>
              <Badge className="max-w-full truncate border-violet-500/40 bg-violet-500/10 text-[10px] text-violet-300" variant="outline">
                {inviteStatusLabel(vendor.inviteStatus)}
              </Badge>
            </div>

            <div className="flex justify-end">
              <ChevronRight className="size-4 text-muted-foreground/50" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
