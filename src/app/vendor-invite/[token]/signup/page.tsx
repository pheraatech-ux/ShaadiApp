import Link from "next/link";

import { VendorInviteSignupForm } from "@/components/auth/vendor-invite-signup-form";
import { buttonVariants } from "@/components/ui/button";
import { getVendorInviteSplashContext } from "@/lib/vendor-invite-context";

type VendorInviteSignupPageProps = {
  params: Promise<{ token: string }>;
};

export default async function VendorInviteSignupPage({ params }: VendorInviteSignupPageProps) {
  const { token } = await params;
  const safeToken = token?.trim();

  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Invalid invite link</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This invite link is invalid or malformed. Ask your planner to send a fresh invite.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/auth" className={buttonVariants({ className: "rounded-xl" })}>
              Go to sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const splash = await getVendorInviteSplashContext(safeToken);

  if (!splash) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Invite unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This invite link is expired, revoked, or already used. Ask your planner to send a fresh link.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/auth" className={buttonVariants({ className: "rounded-xl" })}>
              Go to sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <VendorInviteSignupForm
      token={safeToken}
      inviterName={splash.inviterName}
      vendorName={splash.vendorName}
      weddingCoupleName={splash.weddingCoupleName}
    />
  );
}
