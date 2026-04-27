"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInrFromPaise } from "@/components/wedding-workspace/vendors/vendor-utils";
import { cn } from "@/lib/utils";

type Payment = {
  id: string;
  amount_paise: number;
  note: string | null;
  paid_at: string;
  created_at: string;
};

type VendorPaymentsTabProps = {
  weddingSlug: string;
  vendorId: string;
  quotedPricePaise: number;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const SECTION_LABEL = "mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

export function VendorPaymentsTab({ weddingSlug, vendorId, quotedPricePaise }: VendorPaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const apiBase = `/api/weddings/${weddingSlug}/vendors/${vendorId}/payments`;

  useEffect(() => {
    setLoading(true);
    fetch(apiBase, { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown) => setPayments(Array.isArray(data) ? (data as Payment[]) : []))
      .catch(() => toast.error("Failed to load payments."))
      .finally(() => setLoading(false));
  }, [apiBase]);

  const totalPaidPaise = payments.reduce((s, p) => s + p.amount_paise, 0);
  const balancePaise = quotedPricePaise - totalPaidPaise;
  const paidPercent = quotedPricePaise > 0 ? Math.min(100, Math.round((totalPaidPaise / quotedPricePaise) * 100)) : 0;

  async function handleAdd() {
    const rupees = parseFloat(amountInput);
    if (!rupees || isNaN(rupees) || rupees <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountRupees: rupees, note: noteInput.trim() || null, paidAt: dateInput }),
      });
      if (!res.ok) throw new Error();
      const saved: Payment = await res.json();
      setPayments((prev) => [saved, ...prev]);
      setAmountInput("");
      setNoteInput("");
      setDateInput(new Date().toISOString().slice(0, 10));
      setShowForm(false);
      toast.success("Payment recorded.");
    } catch {
      toast.error("Failed to save payment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setPayments((prev) => prev.filter((p) => p.id !== id));
      toast.success("Payment removed.");
    } catch {
      toast.error("Failed to remove payment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Summary */}
      <div>
        <p className={SECTION_LABEL}>Payment Summary</p>
        <div className="-mx-6 grid grid-cols-3 border-y border-border/60">
          <div className="flex flex-col items-center justify-center px-4 py-4 text-center border-r border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Quoted</span>
            <span className="text-[15px] font-bold text-foreground">{formatInrFromPaise(quotedPricePaise)}</span>
          </div>
          <div className="flex flex-col items-center justify-center px-4 py-4 text-center border-r border-border/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Paid</span>
            <span className="text-[15px] font-bold text-emerald-400">{formatInrFromPaise(totalPaidPaise)}</span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">{paidPercent}%</span>
          </div>
          <div className="flex flex-col items-center justify-center px-4 py-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">Balance</span>
            <span className={cn("text-[15px] font-bold", balancePaise > 0 ? "text-rose-400" : "text-emerald-400")}>
              {formatInrFromPaise(Math.abs(balancePaise))}
            </span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">{balancePaise <= 0 ? "Settled" : "Due"}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
      </div>

      {/* Add payment */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className={cn(SECTION_LABEL, "mb-0")}>Payment History</p>
          <Button
            size="sm"
            className="h-7 rounded-xl gap-1"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="size-3.5" />
            Add payment
          </Button>
        </div>

        {showForm && (
          <div className="mb-4 rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">Record payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0"
                    className="h-8 rounded-lg border-border/70 bg-muted/20 pl-7 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="h-8 rounded-lg border-border/70 bg-muted/20 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Note (optional)</label>
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Advance payment, Final settlement…"
                className="h-8 rounded-lg border-border/70 bg-muted/20 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 rounded-xl" onClick={handleAdd} disabled={saving || !amountInput}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 rounded-xl" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-10 text-center">
            <IndianRupee className="mb-2 size-7 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                  <IndianRupee className="size-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{formatInrFromPaise(p.amount_paise)}</p>
                  {p.note && <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.note}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{fmtDate(p.paid_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  {deletingId === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
