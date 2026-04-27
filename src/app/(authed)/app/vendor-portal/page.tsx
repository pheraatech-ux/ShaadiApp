import { Store } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function VendorPortalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = getSupabaseAdminClient();

  const { data: vendorRows } = await admin
    .from("vendors")
    .select("id, name, category, invite_status, wedding_id, notes, quoted_price_paise, status")
    .eq("user_id", user.id)
    .eq("invite_status", "active");

  const weddingIds = [...new Set((vendorRows ?? []).map((v) => v.wedding_id))];

  const { data: weddingRows } = weddingIds.length > 0
    ? await admin.from("weddings").select("id, couple_name, wedding_date, slug").in("id", weddingIds)
    : { data: [] };

  const weddingMap = new Map((weddingRows ?? []).map((w) => [w.id, w]));

  const bookings = (vendorRows ?? []).map((v) => ({
    ...v,
    wedding: weddingMap.get(v.wedding_id) ?? null,
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-violet-400/25">
            <Store className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Vendor Portal</h1>
            <p className="text-sm text-muted-foreground">Your active wedding bookings</p>
          </div>
        </div>
      </header>

      {bookings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
          <Store className="mb-3 size-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">No active bookings yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">When a planner invites you to a wedding, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-border/70 bg-card px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {booking.category}
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold leading-snug">{booking.name}</h2>
                  {booking.wedding && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.wedding.couple_name}
                      {booking.wedding.wedding_date ? ` · ${fmtDate(booking.wedding.wedding_date)}` : ""}
                    </p>
                  )}
                  {booking.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/70">{booking.notes}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-400 ring-1 ring-violet-500/20">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
