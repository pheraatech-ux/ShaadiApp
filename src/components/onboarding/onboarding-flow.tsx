"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deriveProfileNameFieldsFromUser } from "@/lib/auth/profile-name";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const BUSINESS_TYPES = [
  "Solo planner",
  "Boutique studio",
  "Wedding company",
  "Multi-city planner",
  "Other",
];

const TEAM_SIZES = ["1-3", "4-10", "10-25", "25+"];

type OnboardingFlowProps = {
  firstName: string;
  businessName: string;
  city: string;
  businessType: string;
  teamSize: string;
};

function progressLabel(step: number, total: number) {
  return `Step ${step + 1} of ${total}`;
}

export function OnboardingFlow({
  firstName,
  businessName,
  city,
  businessType,
  teamSize,
}: OnboardingFlowProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavPending, startNav] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [onboardingCity, setOnboardingCity] = useState(city);
  const [onboardingBusinessType, setOnboardingBusinessType] = useState(
    businessType
  );
  const [onboardingTeamSize, setOnboardingTeamSize] = useState(
    TEAM_SIZES.includes(teamSize) ? teamSize : "1-3"
  );
  const [onboardingBusinessName, setOnboardingBusinessName] =
    useState(businessName);

  const totalSteps = 4;

  const canContinue = useMemo(() => {
    if (step === 0) return onboardingCity.trim().length > 0;
    if (step === 1) return onboardingBusinessType.trim().length > 0;
    if (step === 2) return onboardingTeamSize.trim().length > 0;
    return true;
  }, [onboardingBusinessType, onboardingCity, onboardingTeamSize, step]);

  function nextStep() {
    if (!canContinue) return;
    setError(null);
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  }

  function previousStep() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== totalSteps - 1) {
      nextStep();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const metadataPayload = {
      business_name: onboardingBusinessName.trim() || null,
      onboarding_city: onboardingCity.trim() || null,
      onboarding_business_type: onboardingBusinessType || null,
      onboarding_team_size: onboardingTeamSize || null,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_title: `Let's make ${
        (onboardingBusinessName || "your business").trim() || "your business"
      } scalable!`,
      onboarding_welcome_pending: true,
    };

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...metadataPayload,
      },
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Profile saved but we could not sync your workspace profile. Please retry.");
      setIsSubmitting(false);
      return;
    }

    const { firstName: profileFirstName, lastName: profileLastName } =
      deriveProfileNameFieldsFromUser(user);
    const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const profilePhone =
      typeof userMeta.phone === "string" && userMeta.phone.trim() ? userMeta.phone.trim() : null;

    const { error: profileSyncError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: profileFirstName,
        last_name: profileLastName,
        business_name: onboardingBusinessName.trim() || null,
        phone: profilePhone,
      },
      { onConflict: "id" }
    );

    if (profileSyncError) {
      setError(profileSyncError.message);
      setIsSubmitting(false);
      return;
    }

    startNav(() => {
      router.replace("/app/welcome");
    });
  }

  const busy = isSubmitting || isNavPending;
  const firstNameLabel = firstName.trim() || "there";
  const businessNamePlaceholder = firstName.trim()
    ? `${firstName.trim()} Events`
    : "Your Studio";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-neutral-950 px-3 py-6 text-white sm:px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_15%_5%,rgba(16,185,129,0.2),transparent),radial-gradient(ellipse_60%_60%_at_85%_95%,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <div className="mb-3 space-y-1.5 sm:mb-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300/90 uppercase">
            Onboarding
          </p>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Let&apos;s set up your workspace, {firstNameLabel}.
          </h1>
          <p className="text-xs text-white/70">{progressLabel(step, totalSteps)}</p>
        </div>

        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/15 sm:mb-4">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-2.5 sm:space-y-3"
              >
                {step === 0 && (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      Which city do you operate from?
                    </h2>
                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                      We use this for local vendor suggestions and city-aware AI insights.
                    </p>
                    <Input
                      autoFocus
                      value={onboardingCity}
                      onChange={(event) => setOnboardingCity(event.target.value)}
                      placeholder="e.g. Mumbai"
                      className="h-10 rounded-xl border-white/20 bg-white/10 text-sm text-white placeholder:text-white/45"
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      What best describes your business?
                    </h2>
                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                      Pick the closest option. You can change this later in settings.
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {BUSINESS_TYPES.map((type) => {
                        const selected = onboardingBusinessType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setOnboardingBusinessType(type)}
                            className={`group rounded-2xl border px-3.5 py-3 text-left transition ${
                              selected
                                ? "border-emerald-400 bg-emerald-500/20"
                                : "border-white/15 bg-white/5 hover:border-white/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium sm:text-sm">{type}</span>
                              <span
                                className={`inline-flex size-5 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-emerald-300 bg-emerald-400/25 text-emerald-200"
                                    : "border-white/30 text-transparent"
                                }`}
                              >
                                <Check className="size-3.5" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      What&apos;s your team size right now?
                    </h2>
                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                      This helps us tune templates and collaboration defaults.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {TEAM_SIZES.map((size) => {
                        const selected = onboardingTeamSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setOnboardingTeamSize(size)}
                            className={`h-10 rounded-xl border text-xs font-semibold transition sm:text-sm ${
                              selected
                                ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                                : "border-white/20 bg-white/5 text-white/80 hover:border-white/40"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      Last one - what should we call your studio?
                    </h2>
                    <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                      We&apos;ll use this name in your workspace and welcome screen.
                    </p>
                    <Input
                      autoFocus
                      value={onboardingBusinessName}
                      onChange={(event) =>
                        setOnboardingBusinessName(event.target.value)
                      }
                      placeholder={`e.g. ${businessNamePlaceholder}`}
                      className="h-10 rounded-xl border-white/20 bg-white/10 text-sm text-white placeholder:text-white/45"
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100 sm:mt-4">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-white/15 pt-4 sm:mt-5 sm:pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={busy || step === 0}
              onClick={previousStep}
              className="h-10 min-w-[100px] rounded-xl border-white/25 bg-transparent text-xs text-white hover:bg-white/10 sm:text-sm"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={busy || !canContinue}
              className="h-10 min-w-[140px] rounded-xl bg-emerald-500 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 sm:text-sm"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : step === totalSteps - 1 ? (
                <>
                  Finish setup
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
