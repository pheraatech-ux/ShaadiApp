import { TeamKpiCard } from "@/components/app-dashboard/team/team-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamSummaryCardsProps = {
  cards: TeamKpiCard[];
};

export function TeamSummaryCards({ cards }: TeamSummaryCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.id} className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.helperText}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
