import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { deriveProfileNameFieldsFromUser } from "@/lib/auth/profile-name";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasPendingWelcome, needsPlannerOnboarding } from "@/lib/auth/onboarding";

function readMetaString(meta: Record<string, unknown>, key: string): string {
  const value = meta[key];
  return typeof value === "string" ? value : "";
}

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/app/onboarding");
  }

  if (!needsPlannerOnboarding(user)) {
    if (hasPendingWelcome(user)) {
      redirect("/app/welcome");
    }
    redirect("/app/dashboard");
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const { firstName } = deriveProfileNameFieldsFromUser(user);

  return (
    <OnboardingFlow
      firstName={firstName ?? ""}
      businessName={readMetaString(meta, "business_name")}
      city={readMetaString(meta, "onboarding_city")}
      businessType={readMetaString(meta, "onboarding_business_type")}
      teamSize={readMetaString(meta, "onboarding_team_size")}
    />
  );
}
