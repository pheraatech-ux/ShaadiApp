"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type VendorInviteSignupFormProps = {
  token: string;
  inviterName: string;
  vendorName: string;
  weddingCoupleName: string;
};

const inputClass =
  "h-12 rounded-xl bg-muted/50 px-4 text-[15px] transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-background";
const labelClass = "text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground";

export function VendorInviteSignupForm({ token, inviterName, vendorName, weddingCoupleName }: VendorInviteSignupFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invitePath = `/vendor-invite/${encodeURIComponent(token)}`;

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace(invitePath);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(invitePath);
    });

    return () => subscription.unsubscribe();
  }, [invitePath, router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.refresh();
      router.replace(invitePath);
      return;
    }

    setLoading(false);
    setMessage("Account created. Check your email, then return to this invite link.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          Vendor portal invite
        </span>
        <h1 className="mt-3 text-2xl font-semibold">Let&apos;s get you set up!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong className="text-foreground">{inviterName}</strong> has invited{" "}
          <strong className="text-foreground">{vendorName}</strong> to access{" "}
          <strong className="text-foreground">{weddingCoupleName}</strong>&apos;s wedding portal.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="vendor_invite_first_name" className={labelClass}>
                First Name
              </label>
              <Input
                id="vendor_invite_first_name"
                value={firstName}
                required
                placeholder="Meera"
                className={inputClass}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="vendor_invite_last_name" className={labelClass}>
                Last Name
              </label>
              <Input
                id="vendor_invite_last_name"
                value={lastName}
                required
                placeholder="Sharma"
                className={inputClass}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="vendor_invite_email" className={labelClass}>
              Email
            </label>
            <Input
              id="vendor_invite_email"
              type="email"
              value={email}
              required
              placeholder="your@email.com"
              className={inputClass}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Phone Number</label>
            <PhoneInput value={phone} onChangeNumber={setPhone} />
          </div>

          <div className="space-y-2">
            <label htmlFor="vendor_invite_password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Input
                id="vendor_invite_password"
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
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </div>
          </div>

          <Button disabled={loading} className="h-12 w-full gap-2 rounded-xl bg-violet-600 text-[15px] font-bold hover:bg-violet-500" type="submit">
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

          {message ? <p className="text-center text-sm font-medium text-emerald-600">{message}</p> : null}
          {error ? <p className="text-center text-sm font-medium text-destructive">{error}</p> : null}
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/auth?next=${encodeURIComponent(invitePath)}`} className="font-medium underline underline-offset-2">
            Sign in instead
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
