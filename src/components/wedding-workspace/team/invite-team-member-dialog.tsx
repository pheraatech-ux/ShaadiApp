"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";

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
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";

const labelClass = "text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground";
const inputClass = "h-11 rounded-xl bg-muted/40";

type TeamRole = "coordinator" | "assistant" | "viewer";

const roles: {
  id: TeamRole;
  title: string;
  description: string;
}[] = [
  {
    id: "coordinator",
    title: "Coordinator",
    description: "Full access — tasks, vendors, messages, budget view.",
  },
  {
    id: "assistant",
    title: "Assistant",
    description: "Tasks assigned to them only. No budget or vendor access.",
  },
  {
    id: "viewer",
    title: "Viewer",
    description: "Read-only. Can see events and timeline, nothing else.",
  },
];

type InviteTeamMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  roleSectionLabel?: string;
  infoText?: string;
  submitLabel?: string;
  onSubmit?: (payload: { name: string; phone: string; email: string; role: TeamRole }) => Promise<void>;
};

export function InviteTeamMemberDialog({
  open,
  onOpenChange,
  title = "Invite team member",
  description = "They'll get a WhatsApp invite with a wedding-specific join link. Once joined they can only see this wedding.",
  roleSectionLabel = "Role for this wedding",
  infoText = "Invite sent via WhatsApp. The link expires in 48 hours. They join using their phone number — no separate login needed.",
  submitLabel = "Send invite via WhatsApp",
  onSubmit,
}: InviteTeamMemberDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("assistant");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setPhone("");
      setEmail("");
      setRole("assistant");
      setBusy(false);
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit() {
    if (!phone.trim()) {
      setError("WhatsApp number is required.");
      return;
    }

    if (!onSubmit) {
      handleOpenChange(false);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
      });
      handleOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send invite.");
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] max-w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-[520px]"
      >
        <DialogHeader className="relative space-y-1 border-b px-6 pt-5 pb-4">
          <DialogClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-4 rounded-full" />}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogTitle className="pr-10">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="invite-name">
              Name
            </label>
            <Input
              id="invite-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass} htmlFor="invite-wa">
                WhatsApp number <span className="text-destructive">*</span>
              </label>
              <PhoneInput value={phone} onChangeNumber={setPhone} />
            </div>
            <div className="space-y-2">
              <label className={labelClass} htmlFor="invite-email">
                Email (optional)
              </label>
              <Input
                id="invite-email"
                type="email"
                className={inputClass}
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className={labelClass}>{roleSectionLabel}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((r) => {
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex flex-col rounded-xl border p-3 text-left text-sm transition-colors",
                      selected
                        ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                        : "border-border/80 bg-muted/20 hover:bg-muted/40",
                    )}
                  >
                    <span className={cn("font-semibold", selected ? "text-emerald-700 dark:text-emerald-300" : "")}>
                      {r.title}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">{r.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>{infoText}</p>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <div className="flex flex-col gap-2 border-t bg-card px-6 py-4 sm:flex-row sm:gap-3">
          <Button
            type="button"
            className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? "Sending..." : submitLabel}
          </Button>
          <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
