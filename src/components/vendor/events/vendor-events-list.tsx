import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type VendorEvent = {
  id: string;
  title: string;
  event_date: string | null;
  culture_label: string | null;
};

type VendorEventsListProps = {
  events: VendorEvent[];
  weddingCoupleName: string;
  weddingDate: string | null;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isPast(iso: string | null) {
  return iso ? new Date(iso) < new Date() : false;
}

export function VendorEventsList({ events, weddingCoupleName, weddingDate }: VendorEventsListProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {weddingCoupleName}
          {weddingDate
            ? ` · ${new Date(weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`
            : ""}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <Calendar className="mb-3 size-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">No events yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Events for this wedding will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const past = isPast(event.event_date);
            return (
              <div
                key={event.id}
                className={`rounded-xl border border-border/70 bg-card px-5 py-4 ${past ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{event.title}</p>
                    {event.event_date && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="size-3.5 shrink-0" />
                        {fmtDate(event.event_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {event.culture_label && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {event.culture_label}
                      </Badge>
                    )}
                    {past && (
                      <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
                        Past
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
