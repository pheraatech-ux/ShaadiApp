import Link from "next/link";

import { InviteSignupForm } from "@/components/auth/invite-signup-form";
import { buttonVariants } from "@/components/ui/button";
import { getTeamInviteSplashContext } from "@/lib/team-invite-context";

type InviteSignupPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InviteSignupPage({ params }: InviteSignupPageProps) {
  const { token } = await params;
  const safeToken = token?.trim();
  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Invalid invite link</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This invite link is invalid or malformed. Ask your owner to send a fresh invite.
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

  const splash = await getTeamInviteSplashContext(safeToken);

  if (!splash) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <section className="w-full rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-semibold">Invite unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This invite link is expired, revoked, or already used. Ask your owner to send a fresh link.
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
    <InviteSignupForm
      token={safeToken}
      inviterName={splash.inviterName}
      workspaceName={splash.businessName}
    />
  );
}
