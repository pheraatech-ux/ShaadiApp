"use client";

import { useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function welcomeSubline(businessName: string, city: string) {
  const business = businessName.trim() || "Your workspace";
  return city.trim()
    ? `${business} is live and your workspace is ready. AI, proposals, and task templates are calibrated to ${city.trim()}.`
    : `${business} is live and your workspace is ready. AI, proposals, and task templates are calibrated to your city.`;
}

type WelcomeClientProps = {
  firstName: string;
  businessName: string;
  city: string;
};

export function WelcomeClient({
  firstName,
  businessName,
  city,
}: WelcomeClientProps) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const headlineName = firstName.trim() || "there";

  async function leave(href: string) {
    setLeaving(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.updateUser({
      data: { onboarding_welcome_pending: false },
    });
    router.replace(href);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 scale-125 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="relative flex size-[4.5rem] items-center justify-center rounded-full border-2 border-emerald-500/90 bg-emerald-500/10 shadow-[0_0_40px_-8px_rgba(16,185,129,0.55)]">
              <Check
                className="size-9 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome to ShaadiOS, {headlineName}.
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            {welcomeSubline(businessName, city)}
          </p>

          <div className="mt-8 w-full rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-5 py-6 text-center dark:bg-emerald-950/30">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Clock className="size-4 shrink-0" />
              Your free plan includes
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Up to{" "}
              <strong className="font-semibold text-foreground">
                5 active weddings
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-foreground">
                3 team members
              </strong>{" "}
              on the free plan. You&apos;re all set. Upgrade anytime from your
              dashboard if your business grows.
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={leaving}
              className="h-12 flex-1 rounded-xl text-[15px] font-semibold sm:max-w-[220px]"
              onClick={() => void leave("/app/dashboard")}
            >
              Go to dashboard
              <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              disabled={leaving}
              className="h-12 flex-1 rounded-xl bg-emerald-600 text-[15px] font-semibold hover:bg-emerald-700 sm:max-w-[220px] dark:bg-emerald-600 dark:hover:bg-emerald-700"
              onClick={() => void leave("/app/dashboard?createWedding=1")}
            >
              Create first wedding
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
