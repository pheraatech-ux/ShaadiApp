import { cache } from "react";

import { getPlannerContext } from "@/lib/data/app-data";

export type CurrentPlanner = {
  displayName: string;
  email: string;
};

export const getCurrentPlanner = cache(async (): Promise<CurrentPlanner> => {
  const planner = await getPlannerContext();
  return { displayName: planner.displayName, email: planner.email };
});
