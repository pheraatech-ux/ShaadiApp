import { redirect } from "next/navigation";

import { WelcomeClient } from "@/components/onboarding/welcome-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readMetaString(
  meta: Record<string, unknown>,
  key: string,
): string {
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

export default async function OnboardingWelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  if (meta.onboarding_welcome_pending !== true) {
    redirect("/app/dashboard");
  }

  return (
    <WelcomeClient
      firstName={readMetaString(meta, "first_name")}
      businessName={readMetaString(meta, "business_name")}
      city={readMetaString(meta, "onboarding_city")}
    />
  );
}
