"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { passwordSchema } from "@/lib/auth/signup-schema";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ─── Schema ────────────────────────────────────────────────────────────────────

const inviteSignUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type InviteSignUpData = z.infer<typeof inviteSignUpSchema>;

// ─── Component ─────────────────────────────────────────────────────────────────

type InviteSignupFormProps = {
  token: string;
  inviterName: string;
  workspaceName: string;
};

const inputClass =
  "h-12 rounded-xl bg-muted/50 px-4 text-[15px] transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-background";
const labelClass = "text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground";

export function InviteSignupForm({ token, inviterName, workspaceName }: InviteSignupFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const invitePath = `/invite/${encodeURIComponent(token)}`;

  // ─── React Hook Form ──────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InviteSignUpData>({
    resolver: zodResolver(inviteSignUpSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  // ─── Session redirect ─────────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(invitePath);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace(invitePath);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [invitePath, router, supabase]);

  // ─── Submit handler ───────────────────────────────────────────────────────────

  async function onSubmit(data: InviteSignUpData) {
    setLoading(true);
    setMessage(null);
    setServerError(null);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName || null,
          last_name: data.lastName || null,
          phone: phone || null,
        },
      },
    });

    if (signUpError) {
      setServerError(signUpError.message);
      setLoading(false);
      return;
    }

    if (authData.session) {
      router.refresh();
      router.replace(invitePath);
      return;
    }

    setLoading(false);
    setMessage("Account created. Check your email, then return to this invite link.");
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Team invite
        </span>
        <h1 className="mt-3 text-2xl font-semibold">Let&apos;s get you set up!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve been invited to <strong className="text-foreground">{workspaceName}</strong> workspace by{" "}
          <strong className="text-foreground">{inviterName}</strong>.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* ── Name ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invite_first_name" className={labelClass}>
                First Name
              </label>
              <Input
                id="invite_first_name"
                placeholder="Meera"
                className={inputClass}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="invite_last_name" className={labelClass}>
                Last Name
              </label>
              <Input
                id="invite_last_name"
                placeholder="Sharma"
                className={inputClass}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* ── Email ── */}
          <div className="space-y-2">
            <label htmlFor="invite_email" className={labelClass}>
              Email
            </label>
            <Input
              id="invite_email"
              type="email"
              placeholder="your@email.com"
              className={inputClass}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* ── Phone (uncontrolled by RHF — custom component) ── */}
          <div className="space-y-2">
            <label className={labelClass}>Phone Number</label>
            <PhoneInput value={phone} onChangeNumber={setPhone} />
          </div>

          {/* ── Password ── */}
          <div className="space-y-2">
            <label htmlFor="invite_password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Input
                id="invite_password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`${inputClass} pr-11`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </div>
            {/* Real-time requirements checklist */}
            <PasswordRequirements password={password} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* ── Confirm Password ── */}
          <div className="space-y-2">
            <label htmlFor="invite_confirm_password" className={labelClass}>
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="invite_confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className={`${inputClass} pr-11`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-[18px]" />
                ) : (
                  <Eye className="size-[18px]" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            disabled={loading}
            className="h-12 w-full gap-2 rounded-xl text-[15px] font-bold"
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Sign up to continue
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {message ? (
            <p className="text-center text-sm font-medium text-emerald-600">{message}</p>
          ) : null}
          {serverError ? (
            <p className="text-center text-sm font-medium text-destructive">{serverError}</p>
          ) : null}
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth?next=${encodeURIComponent(invitePath)}`}
            className="font-medium underline underline-offset-2"
          >
            Sign in instead
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
