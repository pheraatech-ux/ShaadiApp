/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = { params: Promise<{ weddingSlug: string; vendorId: string; paymentId: string }> };

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug, vendorId, paymentId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  const { error } = await (supabase as any)
    .from("vendor_payments")
    .delete()
    .eq("id", paymentId)
    .eq("vendor_id", vendorId)
    .eq("wedding_id", wedding.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
