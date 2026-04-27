"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Lock, Mail, Phone, Trash2, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VendorPaymentsTab } from "@/components/wedding-workspace/vendors/tabs/vendor-payments-tab";
import { VendorTasksTab, type VendorTask } from "@/components/wedding-workspace/vendors/tabs/vendor-tasks-tab";
import { VendorDocumentsTab } from "@/components/wedding-workspace/vendors/tabs/vendor-documents-tab";
import { TaskDetailPanel } from "@/components/wedding-workspace/tasks/task-detail-panel";
import type { WeddingTasksBoardTask, WeddingTaskPriority } from "@/components/wedding-workspace/tasks/types";
import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";
import {
  formatInrFromPaise,
  inviteStatusLabel,
  vendorStatusLabel,
} from "@/components/wedding-workspace/vendors/vendor-utils";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function paiseToRupees(paise: number) {
  return (paise / 100).toFixed(0);
}

const STATUS_PILL: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  pending: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  declined: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const INVITE_PILL: Record<string, string> = {
  not_invited: "bg-muted/60 text-muted-foreground border border-border/50",
  invited: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const SECTION_LABEL = "mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

function vendorTaskToBoard(task: VendorTask): WeddingTasksBoardTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority as WeddingTaskPriority,
    dueDate: task.due_date,
    linkedEventId: null,
    linkedEventLabel: "",
    assigneeId: null,
    assigneeIds: [],
    assigneeLabel: "—",
    assigneeLabels: [],
    raisedByUserId: null,
    raisedByLabel: "—",
    visibility: [],
    commentCount: 0,
    isAssignedToCurrentUser: false,
    isOverdue: false,
    isDueThisWeek: false,
    createdAt: task.created_at,
  };
}

type Tab = "overview" | "payments" | "tasks" | "documents";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "payments", label: "Payments" },
  { key: "tasks", label: "Tasks" },
  { key: "documents", label: "Documents" },
];

type VendorDetailPanelProps = {
  weddingId: string;
  weddingSlug: string;
  vendor: WeddingVendorRecord;
  onBack: () => void;
  onVendorUpdated: () => void;
  onVendorDeleted: () => void;
};

export function VendorDetailPanel({
  weddingId,
  weddingSlug,
  vendor,
  onBack,
  onVendorUpdated,
  onVendorDeleted,
}: VendorDetailPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeddingTasksBoardTask | null>(null);

  const [name, setName] = useState(vendor.name);
  const [category, setCategory] = useState(vendor.category);
  const [phone, setPhone] = useState(vendor.phone ?? "");
  const [email, setEmail] = useState(vendor.email ?? "");
  const [instagram, setInstagram] = useState(vendor.instagramHandle ?? "");
  const [quotedRupees, setQuotedRupees] = useState(paiseToRupees(vendor.quotedPricePaise));
  const [advanceRupees, setAdvanceRupees] = useState(paiseToRupees(vendor.advancePaidPaise));
  const [isConfirmed, setIsConfirmed] = useState(vendor.status === "confirmed");
  const [notes, setNotes] = useState(vendor.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
    setName(vendor.name); setCategory(vendor.category); setPhone(vendor.phone ?? "");
    setEmail(vendor.email ?? ""); setInstagram(vendor.instagramHandle ?? "");
    setQuotedRupees(paiseToRupees(vendor.quotedPricePaise));
    setAdvanceRupees(paiseToRupees(vendor.advancePaidPaise));
    setIsConfirmed(vendor.status === "confirmed"); setNotes(vendor.notes ?? "");
    setIsEditing(false);
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/vendors`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id, name: name.trim(), category: category.trim(),
          phone: phone.trim(), email: email.trim(), instagramHandle: instagram.trim(),
          quotedPriceRupees: quotedRupees, advancePaidRupees: advanceRupees,
          isConfirmed, notes: notes.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      onVendorUpdated(); setIsEditing(false);
    } finally { setSaving(false); }
  }

  async function deleteVendor() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/vendors`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendor.id }),
      });
      if (!res.ok) throw new Error();
      onVendorDeleted();
    } finally { setDeleting(false); setConfirmDelete(false); }
  }

  async function fetchInviteLink(regenerate: boolean) {
    const res = await fetch(`/api/weddings/${weddingSlug}/vendors/${vendor.id}/invite-link`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate }),
    });
    if (!res.ok) throw new Error("Unable to generate invite link.");
    const data = (await res.json()) as { inviteUrl: string };
    await navigator.clipboard.writeText(data.inviteUrl);
    onVendorUpdated();
  }

  async function handleCopyLink() {
    setCopyingLink(true); setLinkCopied(false);
    try { await fetchInviteLink(false); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
    finally { setCopyingLink(false); }
  }

  async function handleNewLink() {
    setGeneratingLink(true); setLinkCopied(false);
    try { await fetchInviteLink(true); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
    finally { setGeneratingLink(false); }
  }

  const balancePaise = vendor.quotedPricePaise - vendor.advancePaidPaise;

  if (selectedTask) {
    return (
      <TaskDetailPanel
        weddingSlug={weddingSlug}
        task={selectedTask}
        members={[]}
        onBack={() => setSelectedTask(null)}
        onTaskUpdated={(taskId, updates) => {
          setSelectedTask((prev) => prev ? { ...prev, ...updates } : null);
          router.refresh();
        }}
        onTaskDeleted={() => {
          setSelectedTask(null);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card px-4 py-2.5">
        <button
          type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />Back to vendors
        </button>
        <span className="text-border">·</span>
        <span className="max-w-xs truncate text-xs text-muted-foreground">{vendor.name}</span>

        <div className="ml-auto flex items-center gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={discardEdits} className="text-xs text-muted-foreground transition-colors hover:text-foreground">Discard</button>
              <Button size="sm" className="h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => void saveChanges()} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15">
                <Unlock className="size-3.5" />Editing
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
              <Lock className="size-3.5" />Edit
            </button>
          )}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sure?</span>
              <button type="button" onClick={() => void deleteVendor()} disabled={deleting} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60">
                {deleting ? "…" : "Yes, delete"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-border/70 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15">
              <Trash2 className="size-3.5" />Delete
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex shrink-0 gap-0 border-b border-border/60 bg-card px-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="flex min-h-0 flex-1 overflow-visible">
            {/* LEFT */}
            <div className="min-w-0 flex-1 border-r border-border/60 px-6 py-6">
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

              {isEditing ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mb-2 h-auto rounded-xl border-border/70 bg-muted/20 py-1.5 text-[22px] font-bold tracking-tight" placeholder="Vendor name" />
              ) : (
                <h1 className="mb-1 text-[22px] font-bold leading-snug tracking-tight text-foreground">{vendor.name}</h1>
              )}
              <p className="mb-6 text-sm text-muted-foreground">
                Added {fmtDate(vendor.createdAt)}
                {vendor.inviteSentAt ? ` · Invited ${fmtDate(vendor.inviteSentAt)}` : ""}
              </p>

              {/* Stat blocks */}
              <div className="-mx-6 grid grid-cols-2 border-y border-border/60 sm:grid-cols-4">
                <div className="flex flex-col items-center justify-center border-r border-border/60 px-4 py-4 text-center">
                  <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Quoted</span>
                  {isEditing ? (
                    <Input value={quotedRupees} onChange={(e) => setQuotedRupees(e.target.value)} type="number" min="0" className="h-8 w-28 rounded-lg border-border/70 bg-muted/40 text-center text-sm" placeholder="0" />
                  ) : (
                    <><span className="text-[15px] font-bold text-foreground">{formatInrFromPaise(vendor.quotedPricePaise)}</span><span className="mt-0.5 text-[11px] text-muted-foreground">Total</span></>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center px-4 py-4 text-center sm:border-r sm:border-border/60">
                  <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Advance</span>
                  {isEditing ? (
                    <Input value={advanceRupees} onChange={(e) => setAdvanceRupees(e.target.value)} type="number" min="0" className="h-8 w-28 rounded-lg border-border/70 bg-muted/40 text-center text-sm" placeholder="0" />
                  ) : (
                    <><span className="text-[15px] font-bold text-amber-400">{formatInrFromPaise(vendor.advancePaidPaise)}</span><span className="mt-0.5 text-[11px] text-muted-foreground">Paid</span></>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center border-r border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
                  <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Balance</span>
                  <span className={cn("text-[15px] font-bold", balancePaise > 0 ? "text-rose-400" : "text-emerald-400")}>{formatInrFromPaise(Math.abs(balancePaise))}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{balancePaise > 0 ? "Remaining" : "Settled"}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-t border-border/60 px-4 py-4 text-center sm:border-t-0">
                  <span className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</span>
                  {isEditing ? (
                    <button type="button" onClick={() => setIsConfirmed((v) => !v)} className={cn("rounded-lg border px-3 py-1 text-xs font-semibold transition-colors", isConfirmed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground")}>
                      {isConfirmed ? "Confirmed ✓" : "Mark confirmed"}
                    </button>
                  ) : (
                    <><span className={cn("text-[15px] font-bold", vendor.status === "confirmed" ? "text-emerald-400" : vendor.status === "declined" ? "text-red-400" : "text-foreground")}>{vendorStatusLabel(vendor.status)}</span><span className="mt-0.5 text-[11px] text-muted-foreground">Booking</span></>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="mt-6">
                <p className={SECTION_LABEL}>Contact</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5"><Phone className="size-3.5 shrink-0 text-muted-foreground" /><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" /></div>
                    <div className="flex items-center gap-2.5"><Mail className="size-3.5 shrink-0 text-muted-foreground" /><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" /></div>
                    <div className="flex items-center gap-2.5"><AtSign className="size-3.5 shrink-0 text-muted-foreground" /><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram handle" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" /></div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5 shrink-0" />{vendor.phone ? <a href={`tel:${vendor.phone}`} className="hover:text-foreground">{vendor.phone}</a> : <span className="italic text-muted-foreground/50">not added</span>}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5 shrink-0" />{vendor.email ? <a href={`mailto:${vendor.email}`} className="hover:text-foreground">{vendor.email}</a> : <span className="italic text-muted-foreground/50">not added</span>}</p>
                    <p className="flex items-center gap-2 text-muted-foreground"><AtSign className="size-3.5 shrink-0" />{vendor.instagramHandle ? <span>{vendor.instagramHandle}</span> : <span className="italic text-muted-foreground/50">not added</span>}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-6">
                <p className={SECTION_LABEL}>Notes (internal)</p>
                {isEditing ? (
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this vendor…" className="min-h-24 resize-none rounded-xl border-border/70 bg-muted/20 text-sm leading-relaxed" />
                ) : notes ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{notes}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/40">No notes added.</p>
                )}
              </div>
            </div>

            {/* RIGHT sidebar */}
            <div className="w-72 shrink-0 divide-y divide-border/60 overflow-y-auto">
              <div className="px-5 py-5">
                <p className={SECTION_LABEL}>Vendor Info</p>
                <dl className="space-y-2.5">
                  {[
                    { label: "Category", value: vendor.category },
                    { label: "Added on", value: fmtDate(vendor.createdAt) },
                    { label: "Invite status", value: inviteStatusLabel(vendor.inviteStatus) },
                    { label: "Invited on", value: vendor.inviteSentAt ? fmtDate(vendor.inviteSentAt) : "—" },
                    { label: "Portal access", value: vendor.userId ? "Joined" : "Not joined" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-2 text-xs">
                      <dt className="shrink-0 text-muted-foreground">{label}</dt>
                      <dd className="text-right font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {isEditing && (
                <div className="px-5 py-5">
                  <p className={SECTION_LABEL}>Category</p>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Photography" className="h-8 rounded-xl border-border/70 bg-muted/20 text-sm" />
                </div>
              )}

              <div className="px-5 py-5">
                <p className={SECTION_LABEL}>Portal Invite</p>
                <div className="space-y-2">
                  {linkCopied && <p className="text-center text-[11px] font-medium text-emerald-400">Link copied!</p>}
                  <Button type="button" variant="outline" className="h-9 w-full rounded-xl" onClick={() => void handleCopyLink()} disabled={copyingLink || generatingLink}>
                    {copyingLink ? "Copying…" : "Copy invite link"}
                  </Button>
                  {vendor.inviteStatus !== "not_invited" && (
                    <Button type="button" variant="outline" className="h-9 w-full rounded-xl text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400" onClick={() => void handleNewLink()} disabled={copyingLink || generatingLink}>
                      {generatingLink ? "Generating…" : "New link"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <VendorPaymentsTab
            weddingSlug={weddingSlug}
            vendorId={vendor.id}
            quotedPricePaise={vendor.quotedPricePaise}
          />
        )}

        {activeTab === "tasks" && (
          <VendorTasksTab
            weddingSlug={weddingSlug}
            vendorId={vendor.id}
            vendorHasJoined={vendor.inviteStatus === "active"}
            onTaskClick={(task) => setSelectedTask(vendorTaskToBoard(task))}
          />
        )}

        {activeTab === "documents" && (
          <VendorDocumentsTab
            weddingSlug={weddingSlug}
            weddingId={weddingId}
            vendorId={vendor.id}
          />
        )}
      </div>
    </div>
  );
}
