import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{
    employeeId: string;
  }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { employeeId } = await context.params;
    if (!employeeId) {
      return NextResponse.json({ error: "Employee id is required." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(_request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (employeeId === user.id) {
      return NextResponse.json({ error: "The workspace owner cannot be removed from the team." }, { status: 403 });
    }

    const { data: employeeRow, error: fetchError } = await supabase
      .from("company_employees")
      .select("id, user_id, owner_user_id")
      .eq("id", employeeId)
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message || "Unable to remove employee." }, { status: 400 });
    }
    if (!employeeRow) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    if (employeeRow.user_id === user.id) {
      return NextResponse.json({ error: "You cannot remove your workspace owner account from the team." }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from("company_employees").delete().eq("id", employeeId).eq("owner_user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message || "Unable to remove employee." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to remove employee." }, { status: 500 });
  }
}
