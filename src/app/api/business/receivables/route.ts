import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("business_overdue_receivables")
    .select("id, client_name, amount_paise, due_since, created_at")
    .eq("owner_user_id", user.id)
    .order("due_since", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as {
    clientName?: string;
    amountRupees?: number;
    dueSince?: string;
  };

  const clientName = body.clientName?.trim();
  const amountRupees = body.amountRupees;
  const dueSince = body.dueSince;

  if (!clientName) return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  if (!amountRupees || amountRupees <= 0) return NextResponse.json({ error: "Amount must be positive." }, { status: 400 });
  if (!dueSince) return NextResponse.json({ error: "Due date is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("business_overdue_receivables")
    .insert({
      owner_user_id: user.id,
      client_name: clientName,
      amount_paise: Math.round(amountRupees * 100),
      due_since: dueSince,
    })
    .select("id, client_name, amount_paise, due_since, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
