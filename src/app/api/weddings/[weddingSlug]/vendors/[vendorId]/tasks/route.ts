import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ weddingSlug: string; vendorId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug, vendorId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  // Get the vendor's linked user_id (may be null if not yet joined)
  const admin = getSupabaseAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, user_id")
    .eq("id", vendorId)
    .eq("wedding_id", wedding.id)
    .maybeSingle();

  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  if (!vendor.user_id) return NextResponse.json([]);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, status, due_date, priority, description, created_at")
    .eq("wedding_id", wedding.id)
    .contains("assignee_user_ids", [vendor.user_id])
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(tasks ?? []);
}
