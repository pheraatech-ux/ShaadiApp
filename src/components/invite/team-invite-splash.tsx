import Link from "next/link";
import { Users } from "lucide-react";

import { cn } from "@/lib/utils";

type TeamInviteSplashProps = {
  token: string;
  businessName: string;
  inviterName: string;
  inviterInitials: string;
  roleLabel: string;
  expiresAtIso: string;
};

function expiryFooterLine(iso: string) {
  const expires = new Date(iso);
  const now = Date.now();
  const ms = expires.getTime() - now;
  if (ms <= 0) {
    return "This link has expired";
  }
  const hoursTotal = Math.ceil(ms / 3600000);
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  if (days >= 2) {
    return `This link expires in ${days} days`;
  }
  if (days === 1) {
    return hours > 0 ? "This link expires in 1 day" : "This link expires in 24 hours";
  }
  if (hoursTotal <= 1) {
    return "This link expires in less than an hour";
  }
  return `This link expires in ${hoursTotal} hours`;
}

export function TeamInviteSplash({
  token,
  businessName,
  inviterName,
  inviterInitials,
  roleLabel,
  expiresAtIso,
}: TeamInviteSplashProps) {
  const signupHref = `/invite/${encodeURIComponent(token)}/signup`;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f18] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10 pb-8">
        <header className="mb-10 space-y-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
            You&apos;ve been invited
          </p>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-[2rem]">
            Join your team on <span className="font-bold italic text-sky-400">ShaadiOS</span>
          </h2>
          <p className="mx-auto max-w-sm text-pretty text-sm leading-relaxed text-neutral-400">
            <span className="text-neutral-300">{inviterName}</span> has invited you to collaborate at{" "}
            <span className="font-medium text-neutral-200">{businessName}</span>. Create your account to get started — takes
            less than a minute.
          </p>
        </header>

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10",
            "bg-gradient-to-br from-emerald-950/80 via-neutral-950 to-neutral-950",
            "px-4 py-5 shadow-lg shadow-black/30",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(16,185,129,0.22),transparent)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/25">
              <Users className="size-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="text-balance text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">{businessName}</h1>
            <p className="mt-1.5 max-w-[260px] text-pretty text-xs leading-relaxed text-neutral-400">
              Collaborate on weddings, tasks, and clients for this business.
            </p>
            <div className="mt-4 flex w-full justify-center">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {inviterInitials}
                </span>
                <span className="min-w-0 text-left text-xs font-medium text-neutral-100">
                  Invited by <span className="text-white">{inviterName}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400">
          You&apos;ve been invited as <span className="font-semibold text-white">{roleLabel}</span>
        </p>

        <div className="mt-6 w-full">
          <Link
            href={signupHref}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-xl border-0",
              "bg-emerald-600 text-[15px] font-bold text-white shadow-sm",
              "transition-colors hover:bg-emerald-500 active:bg-emerald-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60",
            )}
          >
            Join as {roleLabel}
          </Link>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] leading-relaxed text-neutral-600">
          {expiryFooterLine(expiresAtIso)} · Powered by ShaadiOS
        </p>
      </main>
    </div>
  );
}
