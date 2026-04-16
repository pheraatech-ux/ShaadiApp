import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type CompanyEmployeeRole = Database["public"]["Enums"]["company_employee_role"];

type CreateEmployeePayload = {
  name?: string;
  phone?: string;
  email?: string;
  role?: CompanyEmployeeRole;
};

const VALID_ROLES = new Set<CompanyEmployeeRole>(["coordinator", "assistant", "viewer"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateEmployeePayload;
    const name = payload.name?.trim();
    const phone = payload.phone?.trim();
    const email = payload.email?.trim();
    const role = payload.role ?? "assistant";

    if (!phone) {
      return NextResponse.json({ error: "WhatsApp number is required." }, { status: 400 });
    }
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error } = await supabase.from("company_employees").insert({
      owner_user_id: user.id,
      name: name || "Team member",
      phone,
      email: email || null,
      role,
      employment_status: "invited",
      invited_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ error: "Company employees table is missing. Run latest migrations." }, { status: 500 });
      }
      return NextResponse.json({ error: error.message || "Unable to invite employee." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to invite employee." }, { status: 500 });
  }
}
