import Link from "next/link";

import { VendorInviteSplash } from "@/components/invite/vendor-invite-splash";
import { VendorInviteWelcome } from "@/components/invite/vendor-invite-welcome";
import { hashVendorInviteToken } from "@/lib/vendor-invites";
import { getVendorInviteSplashContext, getVendorInviteWelcomeContext } from "@/lib/vendor-invite-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VendorInvitePageProps = {
  params: Promise<{ token: string }>;
};

type InviteClaimResult =
  | "accepted"
  | "expired"
  | "revoked"
  | "claimed"
  | "identity_mismatch"
  | "invalid"
  | "error";

function getInviteStateCopy(state: InviteClaimResult) {
  switch (state) {
    case "accepted":
      return {
        title: "Vendor invite accepted",
        description: "You now have access to the wedding vendor portal.",
        ctaLabel: "Go to vendor portal",
        ctaHref: "/app/vendor-portal",
      };
    case "identity_mismatch":
      return {
        title: "This invite does not match your account",
        description: "Sign in with the invited email or phone number to accept this invite.",
        ctaLabel: "Switch account",
        ctaHref: "/auth",
      };
    case "expired":
      return {
        title: "Invite expired",
        description: "This invite link has expired. Ask your planner to send a fresh invite.",
        ctaLabel: "Go to sign in",
        ctaHref: "/auth",
      };
    case "revoked":
      return {
        title: "Invite revoked",
        description: "This invite is no longer active. Ask your planner to re-send a new invite link.",
        ctaLabel: "Go to sign in",
        ctaHref: "/auth",
      };
    case "claimed":
      return {
        title: "Invite already used",
        description: "This invite link has already been claimed. If you need access, ask your planner for a new link.",
        ctaLabel: "Go to vendor portal",
        ctaHref: "/app/vendor-portal",
      };
    default:
      return {
        title: "Invalid invite link",
        description: "This invite link is invalid or malformed. Ask your planner to send a valid link.",
        ctaLabel: "Go to sign in",
        ctaHref: "/auth",
      };
  }
}

export default async function VendorInvitePage({ params }: VendorInvitePageProps) {
  const { token } = await params;
  const safeToken = token?.trim();

  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) {
    const copy = getInviteStateCopy("invalid");
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{copy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={copy.ctaHref} className={buttonVariants({ className: "rounded-xl" })}>
              {copy.ctaLabel}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const splash = await getVendorInviteSplashContext(safeToken);
    if (!splash) {
      const copy = getInviteStateCopy("invalid");
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
          <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
            <h1 className="text-2xl font-semibold">{copy.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{copy.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={copy.ctaHref} className={buttonVariants({ className: "rounded-xl" })}>
                {copy.ctaLabel}
              </Link>
            </div>
          </section>
        </main>
      );
    }
    return (
      <VendorInviteSplash
        token={safeToken}
        vendorName={splash.vendorName}
        vendorCategory={splash.vendorCategory}
        weddingCoupleName={splash.weddingCoupleName}
        inviterName={splash.inviterName}
        inviterInitials={splash.inviterInitials}
        expiresAtIso={splash.expiresAtIso}
      />
    );
  }

  const admin = getSupabaseAdminClient();
  const tokenHash = hashVendorInviteToken(safeToken);

  const [{ data: profile }, { data: inviteRow }] = await Promise.all([
    supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle(),
    admin.from("vendor_invites").select("claimed_at, claimed_by_user_id").eq("token_hash", tokenHash).maybeSingle(),
  ]);

  let claimState: InviteClaimResult;
  if (inviteRow?.claimed_at) {
    claimState = inviteRow.claimed_by_user_id === user.id ? "accepted" : "claimed";
  } else {
    const { data: claimRows, error: claimError } = await admin.rpc("claim_vendor_invite", {
      p_token_hash: tokenHash,
      p_user_id: user.id,
      p_user_email: user.email ?? "",
      p_user_phone: profile?.phone ?? undefined,
    });

    claimState = claimError ? "error" : ((claimRows?.[0]?.result as InviteClaimResult | undefined) ?? "invalid");
  }

  if (claimState === "accepted") {
    const welcome = await getVendorInviteWelcomeContext(safeToken, user.id, user.email ?? null);
    if (welcome) {
      return (
        <VendorInviteWelcome
          firstName={welcome.firstName}
          vendorName={welcome.vendorName}
          weddingCoupleName={welcome.weddingCoupleName}
        />
      );
    }
  }

  const copy = getInviteStateCopy(claimState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            claimState === "accepted"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          )}
        >
          Invite status
        </span>
        <h1 className="mt-3 text-2xl font-semibold">{copy.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{copy.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={copy.ctaHref} className={buttonVariants({ className: "rounded-xl" })}>
            {copy.ctaLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
