"use client";

import { useEffect, useMemo, useState } from "react";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import { VENDOR_CATEGORY_OPTIONS, normalizeInstagram } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type VendorFormValues = {
  category: string;
  name: string;
  phone: string;
  email: string;
  instagramHandle: string;
  quotedPriceRupees: string;
  advancePaidRupees: string;
  notes: string;
  isConfirmed: boolean;
};

type VendorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  vendor?: WeddingVendorRecord | null;
  onSubmit: (values: VendorFormValues) => Promise<void>;
};

function buildInitialValues(vendor?: WeddingVendorRecord | null): VendorFormValues {
  return {
    category: vendor?.category || "Photo",
    name: vendor?.name || "",
    phone: vendor?.phone || "",
    email: vendor?.email || "",
    instagramHandle: vendor?.instagramHandle || "",
    quotedPriceRupees: vendor ? String(Math.round(vendor.quotedPricePaise / 100)) : "",
    advancePaidRupees: vendor ? String(Math.round(vendor.advancePaidPaise / 100)) : "",
    notes: vendor?.notes || "",
    isConfirmed: vendor?.status === "confirmed",
  };
}

export function VendorFormDialog({ open, onOpenChange, mode, vendor, onSubmit }: VendorFormDialogProps) {
  const [values, setValues] = useState<VendorFormValues>(buildInitialValues(vendor));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "create" ? "Add vendor" : `Edit ${vendor?.name ?? "vendor"}`;
  const subtitle =
    mode === "create"
      ? "Add a vendor for this wedding workspace."
      : "Update vendor profile, pricing and invite readiness.";

  const canSave = useMemo(() => values.name.trim().length > 1 && values.category.trim().length > 0, [values.category, values.name]);

  function patchValue<K extends keyof VendorFormValues>(key: K, next: VendorFormValues[K]) {
    setValues((current) => ({ ...current, [key]: next }));
  }

  useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(vendor));
    setBusy(false);
    setError(null);
  }, [mode, open, vendor]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        ...values,
        instagramHandle: normalizeInstagram(values.instagramHandle),
      });
      handleOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save vendor.");
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-[520px]">
        <DialogHeader className="shrink-0 border-b px-6 pt-5 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Category</p>
            <div className="grid gap-2 sm:grid-cols-4">
              {VENDOR_CATEGORY_OPTIONS.map((option) => {
                const active = values.category === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-left transition-colors",
                      active ? "border-emerald-500 bg-emerald-500/10" : "border-border/70 bg-muted/10 hover:bg-muted/30",
                    )}
                    onClick={() => patchValue("category", option.value)}
                  >
                    <p className="text-base">{option.icon}</p>
                    <p className="mt-0.5 text-xs font-medium">{option.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="vendor-name">
              Vendor / business name
            </label>
            <Input
              id="vendor-name"
              placeholder="e.g. Ravi Mehta Photography"
              value={values.name}
              onChange={(event) => patchValue("name", event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Phone (for WhatsApp invite)
              </label>
              <PhoneInput value={values.phone} onChangeNumber={(phone) => patchValue("phone", phone)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="vendor-email">
                Email
              </label>
              <Input
                id="vendor-email"
                type="email"
                placeholder="vendor@email.com"
                value={values.email}
                onChange={(event) => patchValue("email", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="vendor-instagram">
              Instagram handle
            </label>
            <Input
              id="vendor-instagram"
              placeholder="@ravimehta.photo"
              value={values.instagramHandle}
              onChange={(event) => patchValue("instagramHandle", event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="quoted-price">
                Quoted price (INR)
              </label>
              <Input
                id="quoted-price"
                type="number"
                min={0}
                placeholder="180000"
                value={values.quotedPriceRupees}
                onChange={(event) => patchValue("quotedPriceRupees", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="advance-paid">
                Advance paid (INR)
              </label>
              <Input
                id="advance-paid"
                type="number"
                min={0}
                placeholder="50000"
                value={values.advancePaidRupees}
                onChange={(event) => patchValue("advancePaidRupees", event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Mark as confirmed / booked</p>
                <p className="text-xs text-muted-foreground">Off = shortlisted, On = confirmed and booked</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values.isConfirmed}
                className={cn(
                  "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
                  values.isConfirmed ? "bg-emerald-600" : "bg-muted",
                )}
                onClick={() => patchValue("isConfirmed", !values.isConfirmed)}
              >
                <span
                  className={cn(
                    "inline-block size-6 transform rounded-full bg-white transition-transform",
                    values.isConfirmed ? "translate-x-7" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase" htmlFor="vendor-notes">
              Notes (internal only)
            </label>
            <Textarea
              id="vendor-notes"
              placeholder="e.g. Rates negotiable, check Dec 14 availability"
              rows={4}
              value={values.notes}
              onChange={(event) => patchValue("notes", event.target.value)}
            />
          </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={handleSubmit} disabled={!canSave || busy}>
            {busy ? "Saving..." : mode === "create" ? "Save vendor" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
