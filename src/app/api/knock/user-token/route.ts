import { type NextRequest, NextResponse } from "next/server";

import { generateKnockUserToken } from "@/lib/knock";
import { getKnockPublicKey } from "@/lib/env";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [userToken, publicKey] = await Promise.all([
    generateKnockUserToken(user.id),
    Promise.resolve(getKnockPublicKey()),
  ]);

  return NextResponse.json({ userId: user.id, userToken: userToken ?? null, publicKey });
}
