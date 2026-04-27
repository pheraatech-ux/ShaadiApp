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

  const { data: docs, error } = await (supabase as any)
    .from("documents")
    .select("id, title, category, description, file_url, file_name, file_size_bytes, file_type, created_at, created_by_user_id")
    .eq("wedding_id", wedding.id)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(docs ?? []);
}
