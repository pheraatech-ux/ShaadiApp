"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuickAddKind = "task" | "vendor" | "message" | "document" | "budget" | "event";

type WorkspaceQuickAddFormProps = {
  weddingSlug: string;
  kind: QuickAddKind;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryPlaceholder: string;
  secondaryPlaceholder?: string;
};

export function WorkspaceQuickAddForm({
  weddingSlug,
  kind,
  primaryLabel,
  secondaryLabel,
  primaryPlaceholder,
  secondaryPlaceholder,
}: WorkspaceQuickAddFormProps) {
  const router = useRouter();
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!primary.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/records`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          primary: primary.trim(),
          secondary: secondary.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to save record.");
      }
      setPrimary("");
      setSecondary("");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{primaryLabel}</label>
          <Input
            value={primary}
            onChange={(event) => setPrimary(event.target.value)}
            placeholder={primaryPlaceholder}
            className="h-9"
          />
        </div>
        {secondaryLabel ? (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{secondaryLabel}</label>
            <Input
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              placeholder={secondaryPlaceholder}
              className="h-9"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-end">
          <Button type="submit" size="sm" className="h-9 rounded-xl" disabled={submitting || !primary.trim()}>
            {submitting ? "Saving..." : "Add"}
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
