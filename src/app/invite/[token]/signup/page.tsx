import Link from "next/link";

import { InviteSignupForm } from "@/components/auth/invite-signup-form";
import { buttonVariants } from "@/components/ui/button";
import { hashCompanyEmployeeInviteToken } from "@/lib/company-employee-invites";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type InviteSignupPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function getDisplayName(firstName?: string | null, lastName?: string | null) {
  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return fullName || "your team admin";
}

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

  const admin = getSupabaseAdminClient();
  const tokenHash = hashCompanyEmployeeInviteToken(safeToken);
  const { data: inviteRow } = await admin
    .from("company_employee_invites")
    .select("owner_user_id, expires_at, claimed_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const inviteInvalid =
    !inviteRow ||
    Boolean(inviteRow.claimed_at) ||
    Boolean(inviteRow.revoked_at);

  if (inviteInvalid) {
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

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("first_name, last_name, business_name")
    .eq("id", inviteRow.owner_user_id)
    .maybeSingle();

  return (
    <InviteSignupForm
      token={safeToken}
      inviterName={getDisplayName(ownerProfile?.first_name, ownerProfile?.last_name)}
      workspaceName={ownerProfile?.business_name?.trim() || "planner workspace"}
    />
  );
}
