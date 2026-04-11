"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type AuthStep = "auth" | "profile";

const features = [
  "Multi-wedding planner dashboard",
  "Live vendor, budget & task tracking",
  "AI-powered reports & vendor research",
  "Family and vendor portals included",
];

const inputClass =
  "h-12 rounded-xl bg-muted/50 px-4 text-[15px] transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-background";
const labelClass =
  "text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground";
const teamSizes = ["1-3", "4-10", "10-25", "25+"];
const businessTypes = [
  "Solo planner",
  "Boutique studio",
  "Wedding company",
  "Multi-city planner",
  "Other",
];

export function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("auth");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState("1-3");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [accountCreatedPulse, setAccountCreatedPulse] = useState(false);
  const [businessProfileCompleted, setBusinessProfileCompleted] =
    useState(false);
  const [businessProfilePulse, setBusinessProfilePulse] = useState(false);
  const [dashboardStepPulse, setDashboardStepPulse] = useState(false);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  useEffect(() => {
    if (!accountCreatedPulse) return;

    const timeout = setTimeout(() => {
      setAccountCreatedPulse(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [accountCreatedPulse]);

  useEffect(() => {
    if (!businessProfilePulse) return;

    const timeout = setTimeout(() => {
      setBusinessProfilePulse(false);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [businessProfilePulse]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1500);
        });
        router.refresh();
        router.replace("/app/dashboard");
      }
      return;
    }

    const signUpStartedAt = Date.now();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          business_name: businessName || null,
          phone: phone || null,
        },
      },
    });

    const elapsed = Date.now() - signUpStartedAt;
    if (elapsed < 1500) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1500 - elapsed);
      });
    }

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage(null);
      setError(null);
      setAccountCreatedPulse(true);
      setStep("profile");
    }
    setLoading(false);
  }

  async function handleCompleteProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileLoading(true);
    setMessage(null);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "We could not find your active session. Please sign in to complete your profile."
      );
      setProfileLoading(false);
      return;
    }

    const displayBusinessName = businessName.trim() || "your business";
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName || null,
        last_name: lastName || null,
        business_name: businessName || null,
        phone: phone || null,
        onboarding_city: city || null,
        onboarding_business_type: businessType || null,
        onboarding_team_size: teamSize || null,
        onboarding_logo_file_name: logoFile?.name ?? null,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_title: `Let's make ${displayBusinessName} scalable!`,
        onboarding_welcome_pending: true,
      },
    });

    if (updateError) {
      setError(updateError.message);
      setProfileLoading(false);
      return;
    }

    setBusinessProfileCompleted(true);
    setBusinessProfilePulse(true);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 800);
    });

    setDashboardStepPulse(true);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 950);
    });
    setProfileLoading(false);
    router.replace("/app/welcome");
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left Panel: Brand / Hero ── */}
      <div className="relative hidden h-full w-1/2 flex-col items-start overflow-hidden bg-neutral-950 px-14 lg:flex xl:px-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(16,185,129,0.15),transparent),radial-gradient(ellipse_50%_60%_at_100%_100%,rgba(255,255,255,0.04),transparent)]" />

        <div className="relative z-10 flex h-full w-full flex-col py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <span className="text-lg font-bold text-emerald-400">S</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              ShaadiOS
            </span>
          </div>

          <div className="my-auto space-y-10">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl leading-[1.1] font-bold tracking-tight text-white xl:text-5xl">
                Your Wedding
                <br />
                Command&nbsp;Centre.
              </h1>
              {step === "profile" ? (
                <p className="max-w-md text-base leading-relaxed text-neutral-300">
                  One more step. Tell us about your business so we can set up your
                  workspace.
                </p>
              ) : (
                <p className="max-w-sm text-base leading-relaxed text-neutral-400">
                  Manage every wedding, vendor, task and conversation from one sleek
                  workspace built for modern planners.
                </p>
              )}
            </div>

            {step === "profile" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-emerald-300 transition-all duration-500 ${
                      accountCreatedPulse ? "scale-110 animate-pulse" : "scale-100"
                    }`}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                  <span className="text-2xl font-medium text-neutral-100">
                    Account created
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {businessProfileCompleted ? (
                    <>
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/20 text-emerald-300 transition-all duration-500 ${
                          businessProfilePulse
                            ? "scale-110 animate-pulse"
                            : "scale-100"
                        }`}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-2xl font-medium text-neutral-100">
                        Business profile
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-2xl font-semibold text-white">
                        Business profile
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                      dashboardStepPulse
                        ? "scale-110 border-emerald-400 bg-emerald-500/20 text-emerald-300"
                        : "border-neutral-700"
                    }`}
                  >
                    {dashboardStepPulse && (
                      <Check className="size-3.5 animate-pulse" strokeWidth={3} />
                    )}
                  </div>
                  <span
                    className={`text-2xl transition-colors duration-500 ${
                      dashboardStepPulse
                        ? "font-medium text-neutral-100"
                        : "text-neutral-600"
                    }`}
                  >
                    Dashboard & first wedding
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="size-3 text-emerald-400" strokeWidth={3} />
                    </div>
                    <span className="text-[15px] text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs font-medium uppercase tracking-widest text-neutral-600">
            Trusted by 200+ planners across India
          </p>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="relative h-screen w-full flex-1 overflow-y-auto px-6 py-12 sm:px-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-neutral-900">
            <span className="text-base font-bold text-emerald-400">S</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">ShaadiOS</span>
        </div>

        <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col justify-center">
          {/* Header */}
          <div className="mb-10 space-y-3">
            <h2 className="text-4xl font-bold tracking-tight">
              {step === "profile"
                ? "Set up your business profile"
                : mode === "login"
                  ? "Welcome Back"
                  : "Get Started"}
            </h2>
            <p className="text-base text-muted-foreground">
              {step === "profile"
                ? `Let's make ${businessName.trim() || "your business"} scalable!`
                : mode === "login"
                  ? "Sign in to your planner account to continue."
                  : "Set up your planner profile in 30 seconds."}
            </p>
          </div>

          {/* Mode Toggle */}
          {step === "auth" && (
            <div className="mb-8 flex rounded-xl bg-muted p-1.5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {step === "auth" ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <>
                  {/* First / Last Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className={labelClass}>
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        value={firstName}
                        required
                        placeholder="Meera"
                        className={inputClass}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last_name" className={labelClass}>
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        value={lastName}
                        required
                        placeholder="Sharma"
                        className={inputClass}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <label htmlFor="business_name" className={labelClass}>
                      Business Name
                    </label>
                    <Input
                      id="business_name"
                      value={businessName}
                      placeholder="Meera Events"
                      className={inputClass}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  required
                  placeholder="your@email.com"
                  className={inputClass}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone Number (signup only) */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <PhoneInput value={phone} onChangeNumber={setPhone} />
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-11`}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" />
                    ) : (
                      <Eye className="size-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                disabled={loading}
                className="h-12 w-full gap-2 rounded-xl text-[15px] font-bold"
                type="submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating your account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create my account"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              {message && (
                <p className="text-center text-sm font-medium text-emerald-600">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleCompleteProfile}>
              <div className="space-y-2">
                <label htmlFor="onboarding_city" className={labelClass}>
                  City you operate from
                </label>
                <Input
                  id="onboarding_city"
                  value={city}
                  required
                  placeholder="e.g. Mumbai"
                  className={inputClass}
                  onChange={(event) => setCity(event.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Used for local vendor suggestions and AI city context.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className={labelClass}>Logo</label>
                  <span className="text-xs text-muted-foreground">
                    Optional - appears on proposals and reports
                  </span>
                </div>
                <label
                  htmlFor="profile_logo"
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/40 p-4 transition hover:border-emerald-500/50"
                >
                  <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-500/15 text-lg font-bold text-emerald-700">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="size-full rounded-xl object-cover"
                      />
                    ) : businessName.trim() ? (
                      businessName.trim().slice(0, 1).toUpperCase()
                    ) : (
                      <Building2 className="size-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-foreground">
                      Upload your business logo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG or SVG, transparent background preferred.
                    </p>
                    {logoFile && (
                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        {logoFile.name}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    <Upload className="size-4" />
                    Choose file
                  </span>
                </label>
                <input
                  id="profile_logo"
                  type="file"
                  accept=".png,.svg,image/png,image/svg+xml"
                  className="hidden"
                  onChange={(event) => {
                    setLogoFile(event.target.files?.[0] ?? null);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Type of business</label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className={`${inputClass} h-12 w-full`}>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Team size</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {teamSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTeamSize(size)}
                      className={`h-11 rounded-xl border text-sm font-semibold transition ${
                        teamSize === size
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">
                  Free plan includes up to 3 team members. You are within the
                  limit.
                </p>
              </div>

              {error && (
                <p className="text-center text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                disabled={profileLoading}
                className="h-12 w-full gap-2 rounded-xl text-[15px] font-bold"
                type="submit"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Completing profile...
                  </>
                ) : (
                  <>
                    Complete profile
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                disabled={profileLoading}
                onClick={() => {
                  router.refresh();
                  router.replace("/app/dashboard");
                }}
                className="w-full text-center text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip for now - I&apos;ll do this later
              </button>
            </form>
          )}

          {step === "auth" && (
            <>
              {/* Divider */}
              <div className="relative my-8 flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Or
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Social Auth */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 gap-2.5 rounded-xl text-sm font-semibold"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 gap-2.5 rounded-xl text-sm font-semibold"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Phone OTP
                </Button>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="font-medium underline underline-offset-2 hover:text-foreground"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-medium underline underline-offset-2 hover:text-foreground"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
