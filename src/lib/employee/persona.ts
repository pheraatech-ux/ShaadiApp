import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/** Planner = firm owner or any user without a linked company_employees row as staff. */
export type AppPersona = "planner" | "employee";

/**
 * Reads persona from the JWT app_metadata claim (written by the DB trigger on company_employees).
 * No DB round-trip — use this wherever the User object is already available.
 */
export function resolvePersonaFromUser(user: User | null): AppPersona {
  if (user?.app_metadata?.persona === "employee") return "employee";
  return "planner";
}

/**
 * Resolves whether the user is staff at another owner's firm (employee portal)
 * or operates as the main planner experience.
 */
export async function resolvePersona(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppPersona> {
  const { data, error } = await supabase
    .from("company_employees")
    .select("id, owner_user_id, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return "planner";
  }

  if (data.owner_user_id !== userId) {
    return "employee";
  }

  return "planner";
}

export async function getCurrentPersona() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { userId: null as string | null, persona: null as AppPersona | null };
  }
  return { userId: user.id, persona: resolvePersonaFromUser(user) };
}

/**
 * Maps a planner `/app/...` path to the employee equivalent under `/app/employee/...`.
 */
export function plannerPathToEmployeePath(pathname: string): string {
  if (pathname.startsWith("/app/employee")) {
    return pathname;
  }
  if (pathname === "/app/welcome") {
    return pathname;
  }

  const prefix = "/app";
  if (!pathname.startsWith(prefix)) {
    return pathname;
  }

  if (pathname === "/app" || pathname === `${prefix}/`) {
    return "/app/employee/dashboard";
  }

  const tail = pathname.slice(prefix.length);
  return `/app/employee${tail}`;
}
