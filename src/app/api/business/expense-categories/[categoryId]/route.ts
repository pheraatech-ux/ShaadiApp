import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Delete all expense entries that belong to this custom category first
  await supabase
    .from("business_expense_entries")
    .delete()
    .eq("category_id", categoryId)
    .eq("owner_user_id", user.id);

  const { error } = await supabase
    .from("business_expense_categories")
    .delete()
    .eq("id", categoryId)
    .eq("owner_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
