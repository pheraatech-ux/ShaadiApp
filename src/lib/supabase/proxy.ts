import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { plannerPathToEmployeePath, resolvePersonaFromUser } from "@/lib/employee/persona";
import { getSupabaseEnv } from "@/lib/env";
import { Database } from "@/types/database";

const AUThed_ROUTE_PREFIX = "/app";
const AUTH_ROUTE_PREFIX = "/auth";

export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith(AUThed_ROUTE_PREFIX);
  const isAuthRoute = pathname.startsWith(AUTH_ROUTE_PREFIX);

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const persona = resolvePersonaFromUser(user);

    if (persona === "employee") {
      const onPlannerAppSurface =
        pathname === "/app" ||
        (pathname.startsWith("/app/") &&
          !pathname.startsWith("/app/employee") &&
          !pathname.startsWith("/app/welcome"));
      if (onPlannerAppSurface) {
        const dest = plannerPathToEmployeePath(pathname);
        if (dest !== pathname) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = dest;
          return NextResponse.redirect(redirectUrl);
        }
      }
    } else if (pathname.startsWith("/app/employee")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = persona === "employee" ? "/app/employee/dashboard" : "/app/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
