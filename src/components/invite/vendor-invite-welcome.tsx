import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type VendorInviteWelcomeProps = {
  firstName: string;
  vendorName: string;
  weddingCoupleName: string;
};

export function VendorInviteWelcome({ firstName, vendorName, weddingCoupleName }: VendorInviteWelcomeProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <header className="text-center">
          <p className="text-lg font-semibold text-white sm:text-xl">You&apos;re in,</p>
          <p className="mt-1 text-3xl font-bold italic tracking-tight text-violet-400 sm:text-4xl">{firstName}</p>
          <p className="mx-auto mt-6 max-w-sm text-pretty text-sm leading-relaxed text-neutral-400">
            <span className="font-medium text-neutral-200">{vendorName}</span> now has access to{" "}
            <span className="font-medium text-neutral-200">{weddingCoupleName}</span>&apos;s wedding portal.
            Here&apos;s what you can see:
          </p>
        </header>

        <div
          className={cn(
            "mt-8 rounded-2xl border border-white/10 bg-neutral-900/80",
            "px-4 py-1 shadow-lg shadow-black/20",
          )}
        >
          <ul className="divide-y divide-white/10 text-sm">
            <li className="py-3.5 text-center text-neutral-300">Wedding event details &amp; timeline</li>
            <li className="py-3.5 text-center text-neutral-300">Your booking and category details</li>
            <li className="py-3.5 text-center text-neutral-300">Coordinator contact information</li>
            <li className="py-3.5 text-center text-neutral-300">
              Role: <span className="font-semibold text-violet-400">Vendor</span>
            </li>
          </ul>
        </div>

        <div className="mt-10 w-full">
          <Link
            href="/app/vendor-portal"
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl",
              "bg-violet-600 text-[15px] font-bold text-white shadow-sm",
              "transition-colors hover:bg-violet-500 active:bg-violet-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
            )}
          >
            Go to vendor portal
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <p className="mt-3 text-center text-[14px] leading-relaxed text-white">
          Next time, just sign in with your email or phone OTP
        </p>
      </main>
    </div>
  );
}
