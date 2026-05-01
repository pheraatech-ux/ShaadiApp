import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("business_expense_entries")
    .select("id, category_id, category_label, amount_paise, entry_date, description, created_at")
    .eq("owner_user_id", user.id)
    .order("entry_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as {
    categoryId?: string;
    categoryLabel?: string;
    amountRupees?: number;
    date?: string;
    description?: string;
  };

  const categoryId = body.categoryId?.trim();
  const categoryLabel = body.categoryLabel?.trim();
  const amountRupees = body.amountRupees;
  const entryDate = body.date;

  if (!categoryId) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!categoryLabel) return NextResponse.json({ error: "Category label is required." }, { status: 400 });
  if (!amountRupees || amountRupees <= 0) return NextResponse.json({ error: "Amount must be positive." }, { status: 400 });
  if (!entryDate) return NextResponse.json({ error: "Date is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("business_expense_entries")
    .insert({
      owner_user_id: user.id,
      category_id: categoryId,
      category_label: categoryLabel,
      amount_paise: Math.round(amountRupees * 100),
      entry_date: entryDate,
      description: body.description?.trim() ?? "",
    })
    .select("id, category_id, category_label, amount_paise, entry_date, description, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
