import { NextResponse } from "next/server";

import { getAppSidebarCounts } from "@/lib/data/app-data";

export async function GET() {
  try {
    const counts = await getAppSidebarCounts();
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
