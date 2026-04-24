"use client";

import { useState } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import {
  formatInrFromPaise,
  inviteStatusLabel,
  toMailtoHref,
  toTelHref,
  vendorStatusLabel,
} from "@/components/wedding-workspace/vendors/vendor-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VendorCardProps = {
  vendor: WeddingVendorRecord;
  onDelete: (vendorId: string) => Promise<void>;
  onEdit: (vendor: WeddingVendorRecord) => void;
  onInvite: (vendor: WeddingVendorRecord) => void;
};

export function VendorCard({ vendor, onDelete, onEdit, onInvite }: VendorCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Card className="border-border/70 py-0">
        <CardContent className="space-y-2 px-3 py-2.5">
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{vendor.name}</p>
              <p className="text-xs text-muted-foreground">{vendor.category}</p>
            </div>
            <Badge
              className={cn(
                "shrink-0 border text-[10px]",
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
          <div className="space-y-0.5 text-xs text-muted-foreground">
            {vendor.phone ? (
              <p className="flex min-w-0 items-center gap-1.5">
                <Phone className="size-3 shrink-0" />
                <a href={toTelHref(vendor.phone)} className="min-w-0 truncate hover:text-foreground">
                  {vendor.phone}
                </a>
              </p>
            ) : null}
            {vendor.email ? (
              <p className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-3 shrink-0" />
                <a href={toMailtoHref(vendor.email)} className="min-w-0 truncate hover:text-foreground">
                  {vendor.email}
                </a>
              </p>
            ) : null}
            <p className="flex min-w-0 items-center gap-1.5 truncate">
              <span>📸</span>
              {vendor.instagramHandle
                ? vendor.instagramHandle
                : <span className="italic text-muted-foreground/50">N/A</span>}
            </p>
          </div>

          {/* Prices */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Quoted</p>
              <p className="text-base font-semibold">{formatInrFromPaise(vendor.quotedPricePaise)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Advance</p>
              <p className="text-base font-semibold text-amber-300">{formatInrFromPaise(vendor.advancePaidPaise)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Badge className="rounded-md border-violet-500/40 bg-violet-500/10 text-[10px] text-violet-300" variant="outline">
              {inviteStatusLabel(vendor.inviteStatus)}
            </Badge>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/40"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3" />
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg px-2.5 text-xs" onClick={() => onEdit(vendor)}>
                Edit
              </Button>
              <Button type="button" size="sm" className="h-7 rounded-lg bg-indigo-600 px-2.5 text-xs text-white hover:bg-indigo-600/90" onClick={() => onInvite(vendor)}>
                {vendor.inviteStatus === "not_sent" ? "Invite" : "Resend"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!open) setDeleteOpen(false); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive" aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{vendor.name}</strong> will be permanently removed from this wedding. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={async (event) => {
                event.preventDefault();
                setDeleting(true);
                try {
                  await onDelete(vendor.id);
                  setDeleteOpen(false);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
