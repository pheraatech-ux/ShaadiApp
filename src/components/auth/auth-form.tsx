"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

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

export function AuthForm() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setMessage("Login successful. Redirecting...");
        router.replace("/app");
      }
      setLoading(false);
      return;
    }

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

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage("Account created. You can now sign in.");
      setMode("login");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left Panel: Brand / Hero ── */}
      <div className="relative hidden w-1/2 flex-col items-start justify-center overflow-hidden bg-neutral-950 px-14 lg:flex xl:px-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(16,185,129,0.15),transparent),radial-gradient(ellipse_50%_60%_at_100%_100%,rgba(255,255,255,0.04),transparent)]" />

        <div className="relative z-10 space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <span className="text-lg font-bold text-emerald-400">S</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              ShaadiOS
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="max-w-md text-4xl leading-[1.1] font-bold tracking-tight text-white xl:text-5xl">
              Your Wedding
              <br />
              Command&nbsp;Centre.
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-neutral-400">
              Manage every wedding, vendor, task and conversation from one sleek
              workspace built for modern planners.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="size-3 text-emerald-400" strokeWidth={3} />
                </div>
                <span className="text-[15px] text-neutral-300">{feature}</span>
              </div>
            ))}
            <p className="pt-3 text-xs font-medium uppercase tracking-widest text-neutral-600">
              Trusted by 200+ planners across India
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="relative flex w-full flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-neutral-900">
            <span className="text-base font-bold text-emerald-400">S</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">ShaadiOS</span>
        </div>

        <div className="w-full max-w-[520px]">
          {/* Header */}
          <div className="mb-10 space-y-3">
            <h2 className="text-4xl font-bold tracking-tight">
              {mode === "login" ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-base text-muted-foreground">
              {mode === "login"
                ? "Sign in to your planner account to continue."
                : "Set up your planner profile in 30 seconds."}
            </p>
          </div>

          {/* Mode Toggle */}
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

          {/* Form */}
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
                  Please wait…
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
        </div>
      </div>
    </div>
  );
}
