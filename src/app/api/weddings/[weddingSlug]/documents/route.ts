import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type RouteContext = { params: Promise<{ weddingSlug: string }> };

type PostBody = {
  title?: string;
  category?: string;
  description?: string | null;
  filePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileType?: string;
};

const VALID_CATEGORIES = new Set(["Client Contracts", "Vendor Contracts", "Employee Contracts", "Other"]);

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { weddingSlug } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();
  if (!wedding) return NextResponse.json({ error: "Wedding not found." }, { status: 404 });

  const body: PostBody = await request.json();
  const { title, category, description, filePath, fileName, fileSizeBytes, fileType } = body;

  if (!title?.trim()) return NextResponse.json({ error: "title is required." }, { status: 400 });
  if (!filePath) return NextResponse.json({ error: "filePath is required." }, { status: 400 });

  const resolvedCategory = VALID_CATEGORIES.has(category ?? "") ? category! : "Other";

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      wedding_id: wedding.id,
      created_by_user_id: user.id,
      title: title.trim(),
      category: resolvedCategory,
      description: description ?? null,
      file_url: filePath,
      file_name: fileName ?? null,
      file_size_bytes: fileSizeBytes ?? null,
      file_type: fileType ?? null,
    } as never)
    .select("id, title, category, description, file_url, file_name, file_size_bytes, file_type, created_at, created_by_user_id")
    .single();

  if (error) {
    console.error("documents insert error", error);
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }

  return NextResponse.json(doc, { status: 201 });
}
