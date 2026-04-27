import Link from "next/link";
import { Store } from "lucide-react";

import { cn } from "@/lib/utils";

type VendorInviteSplashProps = {
  token: string;
  vendorName: string;
  vendorCategory: string;
  weddingCoupleName: string;
  inviterName: string;
  inviterInitials: string;
  expiresAtIso: string;
};

function expiryFooterLine(iso: string) {
  const expires = new Date(iso);
  const ms = expires.getTime() - Date.now();
  if (ms <= 0) return "This link has expired";
  const hoursTotal = Math.ceil(ms / 3600000);
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  if (days >= 2) return `This link expires in ${days} days`;
  if (days === 1) return hours > 0 ? "This link expires in 1 day" : "This link expires in 24 hours";
  if (hoursTotal <= 1) return "This link expires in less than an hour";
  return `This link expires in ${hoursTotal} hours`;
}

export function VendorInviteSplash({
  token,
  vendorName,
  vendorCategory,
  weddingCoupleName,
  inviterName,
  inviterInitials,
  expiresAtIso,
}: VendorInviteSplashProps) {
  const signupHref = `/vendor-invite/${encodeURIComponent(token)}/signup`;

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">
            Vendor portal invite
          </p>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-[2rem]">
            View <span className="font-bold italic text-violet-400">{weddingCoupleName}</span>
            &apos;s wedding on ShaadiOS
          </h2>
          <p className="mx-auto max-w-sm text-pretty text-sm leading-relaxed text-neutral-400">
            <span className="text-neutral-300">{inviterName}</span> has invited{" "}
            <span className="font-medium text-neutral-200">{vendorName}</span> to access the vendor portal for this
            wedding. Create your account to get started.
          </p>
        </header>

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10",
            "bg-gradient-to-br from-violet-950/80 via-neutral-950 to-neutral-950",
            "px-4 py-5 shadow-lg shadow-black/30",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(139,92,246,0.22),transparent)]" />
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-400/25">
              <Store className="size-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="text-balance text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
              {vendorName}
            </h1>
            <p className="mt-1 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
              {vendorCategory}
            </p>
            <p className="mt-3 max-w-[260px] text-pretty text-xs leading-relaxed text-neutral-400">
              Access event details, timeline, and coordinator contact for{" "}
              <span className="text-neutral-200">{weddingCoupleName}</span>&apos;s wedding.
            </p>
            <div className="mt-4 flex w-full justify-center">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {inviterInitials}
                </span>
                <span className="min-w-0 text-left text-xs font-medium text-neutral-100">
                  Invited by <span className="text-white">{inviterName}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <Link
            href={signupHref}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center rounded-xl border-0",
              "bg-violet-600 text-[15px] font-bold text-white shadow-sm",
              "transition-colors hover:bg-violet-500 active:bg-violet-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
            )}
          >
            Access vendor portal
          </Link>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] leading-relaxed text-neutral-600">
          {expiryFooterLine(expiresAtIso)} · Powered by ShaadiOS
        </p>
      </main>
    </div>
  );
}
