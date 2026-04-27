import { type NextRequest, NextResponse } from "next/server";

import { rotateVendorInvite } from "@/lib/vendor-invites";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{
    weddingSlug: string;
    vendorId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = (await request.json().catch(() => ({}))) as { regenerate?: boolean };
    const regenerate = body.regenerate === true;

    const { weddingSlug, vendorId } = await context.params;
    if (!vendorId) {
      return NextResponse.json({ error: "Vendor id is required." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id")
      .eq("slug", weddingSlug)
      .maybeSingle();
    if (weddingError || !wedding) {
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, invite_status")
      .eq("id", vendorId)
      .eq("wedding_id", wedding.id)
      .maybeSingle();
    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const { error: markInvitedError } = await supabase
      .from("vendors")
      .update({ invite_status: "invited", invited_at: nowIso })
      .eq("id", vendorId)
      .eq("invite_status", "not_invited");
    if (markInvitedError) {
      return NextResponse.json({ error: markInvitedError.message || "Unable to update invite status." }, { status: 400 });
    }

    const { inviteUrl, expiresAt, isReused } = await rotateVendorInvite({
      supabase,
      vendorId,
      ownerUserId: user.id,
      deliveryChannel: "link",
      fallbackOrigin: request.nextUrl.origin,
      forceRotate: regenerate,
    });

    return NextResponse.json(
      {
        ok: true,
        vendorId,
        inviteUrl,
        expiresAt,
        mode: regenerate ? "regenerated" : isReused ? "reused" : "created",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to generate invite link." }, { status: 500 });
  }
}
