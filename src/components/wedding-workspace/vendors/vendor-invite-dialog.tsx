"use client";

import { useMemo, useState } from "react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import { toTelHref } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type VendorInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingLabel: string;
  weddingSlug: string;
  vendor: WeddingVendorRecord | null;
  onSendInvite: (vendorId: string) => Promise<void>;
};

function buildJoinLink(weddingSlug: string, vendorId: string) {
  const shortId = vendorId.slice(0, 8);
  return `shaadios.app/join/${weddingSlug}-v-${shortId}`;
}

export function VendorInviteDialog({ open, onOpenChange, weddingLabel, weddingSlug, vendor, onSendInvite }: VendorInviteDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = useMemo(() => {
    if (!vendor) return "";
    return buildJoinLink(weddingSlug, vendor.id);
  }, [vendor, weddingSlug]);

  async function handleSendInvite() {
    if (!vendor) return;
    setBusy(true);
    setError(null);
    try {
      await onSendInvite(vendor.id);
      onOpenChange(false);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send invite.");
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] rounded-2xl p-0">
        <DialogHeader className="border-b px-6 pt-5 pb-4">
          <DialogTitle>Invite {vendor?.name ?? "vendor"} to portal</DialogTitle>
          <DialogDescription>Send a WhatsApp brief with event context, tasks and planner contact details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-300">WhatsApp · via ShaadiOS</p>
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-foreground">
              <p className="text-base">
                <span className="font-semibold">Meera Events</span> has added you to <span className="font-semibold">{weddingLabel}</span>.
              </p>
              <p className="mt-1 text-base">
                Here&apos;s your vendor briefing - view your events, tasks and contact details for{" "}
                <span className="font-semibold">{vendor?.category || "Vendor"}</span>.
              </p>
              <p className="mt-3 text-base text-emerald-200 underline underline-offset-2">{link}</p>
              <p className="mt-2 text-xs text-muted-foreground">Link valid for 7 days</p>
            </div>
          </div>

          {vendor?.phone ? (
            <p className="text-sm text-muted-foreground">
              Recipient:{" "}
              <a href={toTelHref(vendor.phone)} className="underline-offset-2 hover:text-primary hover:underline">
                {vendor.phone}
              </a>
            </p>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" disabled={busy || !vendor} onClick={handleSendInvite}>
            {busy ? "Sending..." : "Send WhatsApp invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
