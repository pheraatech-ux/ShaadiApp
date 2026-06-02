import { type NextRequest, NextResponse } from "next/server";

import { resolvePersonaFromUser } from "@/lib/employee/persona";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export type SearchResult = {
  weddings: { id: string; slug: string; coupleName: string; city: string | null }[];
  tasks: { id: string; title: string; status: string; weddingSlug: string; weddingName: string }[];
  vendors: { id: string; name: string; category: string | null; weddingSlug: string; weddingName: string }[];
  basePath: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ weddings: [], tasks: [], vendors: [], basePath: "/app" } satisfies SearchResult);
  }

  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const persona = resolvePersonaFromUser(user);
  const basePath = persona === "employee" ? "/app/employee" : "/app";

  // 1. Get accessible wedding IDs
  const { data: memberData } = await supabase
    .from("wedding_members")
    .select("wedding_id")
    .eq("user_id", user.id);

  const weddingIds = [...new Set((memberData ?? []).map((r) => r.wedding_id as string))];
  if (!weddingIds.length) {
    return NextResponse.json({ weddings: [], tasks: [], vendors: [], basePath } satisfies SearchResult);
  }

  const pattern = `%${q}%`;

  // 2. Three parallel queries — tasks/vendors join wedding slug+name inline, no extra round-trip
  const [{ data: weddingRows }, { data: taskRows }, { data: vendorRows }] = await Promise.all([
    supabase
      .from("weddings")
      .select("id, slug, couple_name, city")
      .in("id", weddingIds)
      .ilike("couple_name", pattern)
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title, status, weddings!wedding_id(slug, couple_name)")
      .in("wedding_id", weddingIds)
      .ilike("title", pattern)
      .neq("status", "done")
      .limit(5),
    supabase
      .from("vendors")
      .select("id, name, category, weddings!wedding_id(slug, couple_name)")
      .in("wedding_id", weddingIds)
      .ilike("name", pattern)
      .limit(5),
  ]);

  const weddings = (weddingRows ?? []).map((w) => ({
    id: w.id as string,
    slug: w.slug as string,
    coupleName: w.couple_name as string,
    city: w.city as string | null,
  }));

  const tasks = (taskRows ?? []).map((t) => {
    const wedding = t.weddings as { slug: string; couple_name: string } | null;
    return {
      id: t.id as string,
      title: t.title as string,
      status: t.status as string,
      weddingSlug: wedding?.slug ?? "",
      weddingName: wedding?.couple_name ?? "",
    };
  }).filter((t) => t.weddingSlug);

  const vendors = (vendorRows ?? []).map((v) => {
    const wedding = v.weddings as { slug: string; couple_name: string } | null;
    return {
      id: v.id as string,
      name: v.name as string,
      category: v.category as string | null,
      weddingSlug: wedding?.slug ?? "",
      weddingName: wedding?.couple_name ?? "",
    };
  }).filter((v) => v.weddingSlug);

  return NextResponse.json({ weddings, tasks, vendors, basePath } satisfies SearchResult);
}
