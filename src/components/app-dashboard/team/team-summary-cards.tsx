import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { TeamKpiCard } from "@/components/app-dashboard/team/team-types";

type TeamSummaryCardsProps = {
  cards: TeamKpiCard[];
};

export function TeamSummaryCards({ cards }: TeamSummaryCardsProps) {
  return <StatsGrid items={cards} variant="bar" />;
}
