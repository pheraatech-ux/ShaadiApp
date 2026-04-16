"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function HashSessionCapture() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token") || !hash.includes("refresh_token")) {
      return;
    }

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return;
    }

    void (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return;
      }

      window.history.replaceState(null, "", window.location.pathname);
      router.refresh();
      router.replace("/app/dashboard");
    })();
  }, [router, supabase]);

  return null;
}
