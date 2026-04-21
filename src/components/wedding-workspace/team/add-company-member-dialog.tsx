"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TeamRole = "coordinator" | "assistant" | "viewer";

type CompanyMemberCandidate = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  role: TeamRole;
  alreadyAssigned: boolean;
};

type AddCompanyMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingSlug: string;
  onAssigned?: () => Promise<void> | void;
};

const rolePillClassName: Record<TeamRole, string> = {
  coordinator: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  assistant: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  viewer: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};

export function AddCompanyMemberDialog({
  open,
  onOpenChange,
  weddingSlug,
  onAssigned,
}: AddCompanyMemberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CompanyMemberCandidate[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [role, setRole] = useState<TeamRole>("assistant");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuery("");
    setSelectedId("");
    setRole("assistant");
    void (async () => {
      try {
        const response = await fetch(`/api/weddings/${weddingSlug}/members`, {
          credentials: "include",
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          candidates?: CompanyMemberCandidate[];
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load company members.");
        }
        if (!cancelled) {
          setCandidates(payload.candidates ?? []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load company members.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, weddingSlug]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((candidate) => {
      const haystack = [candidate.name, candidate.phone, candidate.email ?? ""].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [candidates, query]);

  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    setRole(selected.role);
  }, [selected]);

  async function handleAssign() {
    if (!selected) {
      setError("Select a team member first.");
      return;
    }
    if (selected.alreadyAssigned) {
      setError("This team member is already assigned to this wedding.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/members`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: selected.id, role }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to assign member.");
      }
      if (onAssigned) {
        await onAssigned();
      }
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to assign member.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-[640px] gap-0 overflow-y-auto rounded-2xl bg-card p-0"
      >
        <DialogHeader className="relative space-y-1 border-b px-6 pt-5 pb-4">
          <DialogClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-4 rounded-full" />}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="pr-10">Add from company team</DialogTitle>
          <DialogDescription>
            Select an existing active company employee to assign to this wedding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-xl bg-muted/30 pl-9"
              placeholder="Search by name, phone, or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Select member</p>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-muted/10 p-2">
              {loading ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">Loading company members...</p>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No matching active company members.</p>
              ) : (
                filtered.map((candidate) => {
                  const active = selectedId === candidate.id;
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedId(candidate.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "border-border/70 bg-background hover:bg-muted/40",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{candidate.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {candidate.phone}
                          {candidate.email ? ` • ${candidate.email}` : ""}
                        </span>
                      </span>
                      <span className="ml-2 shrink-0 text-right">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                            rolePillClassName[candidate.role],
                          )}
                        >
                          {candidate.role.replace("_", " ")}
                        </span>
                        {candidate.alreadyAssigned ? (
                          <span className="mt-1 block text-[10px] font-medium text-amber-700 dark:text-amber-300">
                            Already in wedding
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Wedding role override
            </p>
            <Select value={role} onValueChange={(value) => setRole(value as TeamRole)}>
              <SelectTrigger className="h-11 rounded-xl bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator">Coordinator</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:gap-3">
          <Button
            type="button"
            className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={handleAssign}
            disabled={loading || submitting}
          >
            {submitting ? "Adding..." : "Add to wedding"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
