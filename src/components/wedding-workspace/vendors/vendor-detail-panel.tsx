"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AtSign, Lock, Mail, Phone, Trash2, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import {
  formatInrFromPaise,
  inviteStatusLabel,
  vendorStatusLabel,
} from "@/components/wedding-workspace/vendors/vendor-utils";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function paiseToRupees(paise: number) {
  return (paise / 100).toFixed(0);
}

// ── constants ──────────────────────────────────────────────

const STATUS_PILL: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  pending: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  declined: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const INVITE_PILL: Record<string, string> = {
  not_sent: "bg-muted/60 text-muted-foreground border border-border/50",
  sent: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  joined: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const SECTION_LABEL = "mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

// ── Types ──────────────────────────────────────────────────

type VendorDetailPanelProps = {
  weddingSlug: string;
  vendor: WeddingVendorRecord;
  onBack: () => void;
  onVendorUpdated: () => void;
  onVendorDeleted: () => void;
  onSendInvite: (vendorId: string) => Promise<void>;
};

// ── Component ──────────────────────────────────────────────

export function VendorDetailPanel({
  weddingSlug,
  vendor,
  onBack,
  onVendorUpdated,
  onVendorDeleted,
  onSendInvite,
}: VendorDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  // editable fields
  const [name, setName] = useState(vendor.name);
  const [category, setCategory] = useState(vendor.category);
  const [phone, setPhone] = useState(vendor.phone ?? "");
  const [email, setEmail] = useState(vendor.email ?? "");
  const [instagram, setInstagram] = useState(vendor.instagramHandle ?? "");
  const [quotedRupees, setQuotedRupees] = useState(paiseToRupees(vendor.quotedPricePaise));
  const [advanceRupees, setAdvanceRupees] = useState(paiseToRupees(vendor.advancePaidPaise));
  const [isConfirmed, setIsConfirmed] = useState(vendor.status === "confirmed");
  const [notes, setNotes] = useState(vendor.notes ?? "");

  // action states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [inviting, setInviting] = useState(false);

  // sync from prop when not editing
  useEffect(() => {
    if (isEditing) return;
    setName(vendor.name);
    setCategory(vendor.category);
    setPhone(vendor.phone ?? "");
    setEmail(vendor.email ?? "");
    setInstagram(vendor.instagramHandle ?? "");
    setQuotedRupees(paiseToRupees(vendor.quotedPricePaise));
    setAdvanceRupees(paiseToRupees(vendor.advancePaidPaise));
    setIsConfirmed(vendor.status === "confirmed");
    setNotes(vendor.notes ?? "");
  }, [vendor, isEditing]);

  function discardEdits() {
    setName(vendor.name);
    setCategory(vendor.category);
    setPhone(vendor.phone ?? "");
    setEmail(vendor.email ?? "");
    setInstagram(vendor.instagramHandle ?? "");
    setQuotedRupees(paiseToRupees(vendor.quotedPricePaise));
    setAdvanceRupees(paiseToRupees(vendor.advancePaidPaise));
    setIsConfirmed(vendor.status === "confirmed");
    setNotes(vendor.notes ?? "");
    setIsEditing(false);
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/vendors`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          name: name.trim(),
          category: category.trim(),
          phone: phone.trim(),
          email: email.trim(),
          instagramHandle: instagram.trim(),
          quotedPriceRupees: quotedRupees,
          advancePaidRupees: advanceRupees,
          isConfirmed,
          notes: notes.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      onVendorUpdated();
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVendor() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/vendors`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendor.id }),
      });
      if (!res.ok) throw new Error();
      onVendorDeleted();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSendInvite() {
    setInviting(true);
    try {
      await onSendInvite(vendor.id);
    } finally {
      setInviting(false);
    }
  }

  const balancePaise = vendor.quotedPricePaise - vendor.advancePaidPaise;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to vendors
        </button>
        <span className="text-border">·</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Vendor Details</span>
        <span className="text-border">·</span>
        <span className="max-w-xs truncate text-xs text-muted-foreground">{vendor.name}</span>

        <div className="ml-auto flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={discardEdits}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Discard
              </button>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
                onClick={() => void saveChanges()}
                disabled={saving}
                type="button"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15"
              >
                <Unlock className="size-3.5" />
                Editing
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Lock className="size-3.5" />
              Edit
            </button>
          )}

          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sure?</span>
              <button
                type="button"
                onClick={() => void deleteVendor()}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border/70 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── LEFT ── */}
        <div className="min-w-0 flex-1 overflow-y-auto border-r border-border/60 px-6 py-6">
          {/* Badge row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", STATUS_PILL[vendor.status])}>
              {vendorStatusLabel(vendor.status)}
            </span>
            <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              {isEditing ? category : vendor.category}
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", INVITE_PILL[vendor.inviteStatus])}>
              {inviteStatusLabel(vendor.inviteStatus)}
            </span>
          </div>

          {/* Name */}
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-2 h-auto rounded-xl border-border/70 bg-muted/20 py-1.5 text-[22px] font-bold tracking-tight"
              placeholder="Vendor name"
            />
          ) : (
            <h1 className="mb-1 text-[22px] font-bold leading-snug tracking-tight text-foreground">{vendor.name}</h1>
          )}
          <p className="mb-6 text-sm text-muted-foreground">
            Added {fmtDate(vendor.createdAt)}
            {vendor.inviteSentAt ? ` · Invited ${fmtDate(vendor.inviteSentAt)}` : ""}
          </p>

          {/* Stat blocks — bleed */}
          <div className="-mx-6 grid grid-cols-2 border-y border-border/60 sm:grid-cols-4">
            <div className="flex flex-col items-center justify-center border-r border-border/60 px-4 py-4 text-center">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Quoted</span>
              {isEditing ? (
                <Input
                  value={quotedRupees}
                  onChange={(e) => setQuotedRupees(e.target.value)}
                  type="number"
                  min="0"
                  className="h-8 w-28 rounded-lg border-border/70 bg-muted/40 text-center text-sm"
                  placeholder="0"
                />
              ) : (
                <>
                  <span className="text-[15px] font-bold text-foreground">{formatInrFromPaise(vendor.quotedPricePaise)}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">Total</span>
                </>
              )}
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-4 text-center sm:border-r sm:border-border/60">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Advance</span>
              {isEditing ? (
                <Input
                  value={advanceRupees}
                  onChange={(e) => setAdvanceRupees(e.target.value)}
                  type="number"
                  min="0"
                  className="h-8 w-28 rounded-lg border-border/70 bg-muted/40 text-center text-sm"
                  placeholder="0"
                />
              ) : (
                <>
                  <span className="text-[15px] font-bold text-amber-400">{formatInrFromPaise(vendor.advancePaidPaise)}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">Paid</span>
                </>
              )}
            </div>

            <div className="flex flex-col items-center justify-center border-r border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Balance</span>
              <span className={cn("text-[15px] font-bold", balancePaise > 0 ? "text-rose-400" : "text-emerald-400")}>
                {formatInrFromPaise(Math.abs(balancePaise))}
              </span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">{balancePaise > 0 ? "Remaining" : "Settled"}</span>
            </div>

            <div className="flex flex-col items-center justify-center border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
              <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</span>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmed((v) => !v)}
                  className={cn(
                    "rounded-lg border px-3 py-1 text-xs font-semibold transition-colors",
                    isConfirmed
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isConfirmed ? "Confirmed ✓" : "Mark confirmed"}
                </button>
              ) : (
                <>
                  <span className={cn("text-[15px] font-bold",
                    vendor.status === "confirmed" ? "text-emerald-400"
                    : vendor.status === "declined" ? "text-red-400"
                    : "text-foreground"
                  )}>
                    {vendorStatusLabel(vendor.status)}
                  </span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">Booking</span>
                </>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6">
            <p className={SECTION_LABEL}>Contact</p>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" />
                </div>
                <div className="flex items-center gap-2.5">
                  <AtSign className="size-3.5 shrink-0 text-muted-foreground" />
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram handle" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  {vendor.phone
                    ? <a href={`tel:${vendor.phone}`} className="hover:text-foreground">{vendor.phone}</a>
                    : <span className="italic text-muted-foreground/50">not added</span>}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  {vendor.email
                    ? <a href={`mailto:${vendor.email}`} className="hover:text-foreground">{vendor.email}</a>
                    : <span className="italic text-muted-foreground/50">not added</span>}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <AtSign className="size-3.5 shrink-0 text-muted-foreground" />
                  {vendor.instagramHandle
                    ? <span>{vendor.instagramHandle}</span>
                    : <span className="italic text-muted-foreground/50">not added</span>}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mt-6">
            <p className={SECTION_LABEL}>Notes</p>
            {isEditing ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this vendor…"
                className="min-h-24 resize-none rounded-xl border-border/70 bg-muted/20 text-sm leading-relaxed"
              />
            ) : notes ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{notes}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground/40">No notes added.</p>
            )}
          </div>
        </div>

        {/* ── RIGHT sidebar ── */}
        <div className="w-72 shrink-0 divide-y divide-border/60 overflow-y-auto">
          {/* Vendor info */}
          <div className="px-5 py-5">
            <p className={SECTION_LABEL}>Vendor Info</p>
            <dl className="space-y-2.5">
              {[
                { label: "Category", value: vendor.category },
                { label: "Added on", value: fmtDate(vendor.createdAt) },
                { label: "Invite status", value: inviteStatusLabel(vendor.inviteStatus) },
                { label: "Invited on", value: vendor.inviteSentAt ? fmtDate(vendor.inviteSentAt) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2 text-xs">
                  <dt className="shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Category (edit mode only) */}
          {isEditing && (
            <div className="px-5 py-5">
              <p className={SECTION_LABEL}>Category</p>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Photography"
                className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="px-5 py-5">
            <p className={SECTION_LABEL}>Actions</p>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-xl"
              onClick={() => void handleSendInvite()}
              disabled={inviting}
            >
              {inviting ? "Sending…" : vendor.inviteStatus === "not_sent" ? "Send portal invite" : "Resend invite"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
