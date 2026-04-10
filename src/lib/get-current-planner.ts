import { cache } from "react";

import { resolvePlannerDisplayName } from "@/lib/planner-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentPlanner = {
  displayName: string;
  email: string;
};

export const getCurrentPlanner = cache(async (): Promise<CurrentPlanner> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("first_name, last_name, business_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return {
    displayName: resolvePlannerDisplayName(profile, user),
    email: user?.email ?? "",
  };
});
