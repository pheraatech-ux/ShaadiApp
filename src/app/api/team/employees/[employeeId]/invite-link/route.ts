import { type NextRequest, NextResponse } from "next/server";

import { rotateCompanyEmployeeInvite } from "@/lib/company-employee-invites";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = (await request.json().catch(() => ({}))) as { regenerate?: boolean };
    const regenerate = body.regenerate === true;

    const { employeeId } = await context.params;
    if (!employeeId) {
      return NextResponse.json({ error: "Employee id is required." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: employeeRow, error: employeeError } = await supabase
      .from("company_employees")
      .select("id")
      .eq("id", employeeId)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (employeeError) {
      return NextResponse.json({ error: employeeError.message || "Unable to refresh invite." }, { status: 400 });
    }
    if (!employeeRow) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const { error: markInvitedError } = await supabase
      .from("company_employees")
      .update({ employment_status: "invited", invited_at: nowIso })
      .eq("id", employeeId)
      .eq("owner_user_id", user.id);
    if (markInvitedError) {
      return NextResponse.json({ error: markInvitedError.message || "Unable to refresh invite." }, { status: 400 });
    }

    const { inviteUrl, expiresAt, isReused } = await rotateCompanyEmployeeInvite({
      supabase,
      employeeId,
      ownerUserId: user.id,
      deliveryChannel: "link",
      fallbackOrigin: request.nextUrl.origin,
      forceRotate: regenerate,
    });

    return NextResponse.json(
      {
        ok: true,
        employeeId,
        inviteUrl,
        expiresAt,
        mode: regenerate ? "regenerated" : isReused ? "reused" : "created",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to refresh invite." }, { status: 500 });
  }
}
