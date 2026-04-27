/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = { params: Promise<{ weddingSlug: string; vendorId: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug, vendorId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  const { data: payments, error } = await (supabase as any)
    .from("vendor_payments")
    .select("id, amount_paise, note, paid_at, created_at, created_by_user_id")
    .eq("vendor_id", vendorId)
    .eq("wedding_id", wedding.id)
    .order("paid_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(payments ?? []);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug, vendorId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    amountRupees?: number | string;
    note?: string;
    paidAt?: string;
  };

  const rupees = Number(body.amountRupees);
  if (!rupees || isNaN(rupees) || rupees <= 0) {
    return NextResponse.json({ error: "Valid amount is required." }, { status: 400 });
  }
  const amountPaise = Math.round(rupees * 100);

  const { data: wedding } = await supabase
    .from("weddings").select("id").eq("slug", weddingSlug).maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  const { data: vendor } = await supabase
    .from("vendors").select("id").eq("id", vendorId).eq("wedding_id", wedding.id).maybeSingle();
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  const { data: payment, error } = await (supabase as any)
    .from("vendor_payments")
    .insert({
      vendor_id: vendorId,
      wedding_id: wedding.id,
      amount_paise: amountPaise,
      note: body.note?.trim() || null,
      paid_at: body.paidAt ? new Date(body.paidAt).toISOString() : new Date().toISOString(),
      created_by_user_id: user.id,
    })
    .select("id, amount_paise, note, paid_at, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(payment, { status: 201 });
}
