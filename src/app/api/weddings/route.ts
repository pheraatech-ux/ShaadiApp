import { type NextRequest, NextResponse } from "next/server";

import { createWedding } from "@/lib/data/app-data";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  try {
    const payload = (await request.json()) as {
      brideName?: string;
      groomName?: string;
      weddingDate?: string | null;
      city?: string;
      venueName?: string;
      cultures?: string[];
      events?: { title?: string; eventDate?: string | null; cultureLabel?: string | null }[];
      totalBudgetPaise?: number;
    };

    if (!payload.brideName?.trim() || !payload.groomName?.trim()) {
      return NextResponse.json({ error: "Bride and groom names are required." }, { status: 400 });
    }

    const weddingSlug = await createWedding(
      {
        brideName: payload.brideName,
        groomName: payload.groomName,
        weddingDate: payload.weddingDate ?? undefined,
        city: payload.city,
        venueName: payload.venueName,
        cultures: payload.cultures ?? [],
        events: (payload.events ?? [])
          .filter((event) => Boolean(event.title?.trim()))
          .map((event) => ({
            title: event.title!.trim(),
            eventDate: event.eventDate ?? undefined,
            cultureLabel: event.cultureLabel ?? undefined,
          })),
        totalBudgetPaise: Math.max(0, payload.totalBudgetPaise ?? 0),
      },
      { supabase },
    );

    return NextResponse.json({ weddingSlug }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Unable to create wedding.";
    console.error("POST /api/weddings failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
