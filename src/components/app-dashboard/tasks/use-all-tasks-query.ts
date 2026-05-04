import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { AllTasksBoardTask } from "@/components/wedding-workspace/tasks/types";

export function allTasksQueryKey() {
  return ["all-tasks"] as const;
}

async function fetchAllTasks(): Promise<AllTasksBoardTask[]> {
  const res = await fetch("/api/tasks", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = (await res.json()) as { tasks: AllTasksBoardTask[] };
  return data.tasks;
}

export function useAllTasksQuery(initialData: AllTasksBoardTask[]) {
  return useQuery({
    queryKey: allTasksQueryKey(),
    queryFn: fetchAllTasks,
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

export function useInvalidateAllTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: allTasksQueryKey() });
}
