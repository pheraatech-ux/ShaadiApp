import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = { params: Promise<{ weddingSlug: string; documentId: string }> };

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug, documentId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  // Fetch doc to get storage path — RLS ensures it belongs to this wedding
  const { data: doc } = await supabase
    .from("documents")
    .select("id, file_url, wedding_id")
    .eq("id", documentId)
    .eq("wedding_id", wedding.id)
    .maybeSingle();

  if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  // Delete from storage first (best-effort — continue even if missing)
  if (doc.file_url) {
    await supabase.storage.from("Wedding-Documents").remove([doc.file_url]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) {
    console.error("documents delete error", error);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
