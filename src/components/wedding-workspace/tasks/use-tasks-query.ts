import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";

export function tasksQueryKey(weddingSlug: string) {
  return ["tasks", weddingSlug] as const;
}

async function fetchTasks(weddingSlug: string): Promise<WeddingTasksBoardTask[]> {
  const res = await fetch(`/api/weddings/${weddingSlug}/tasks`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json() as { tasks: WeddingTasksBoardTask[] };
  return data.tasks;
}

export function useTasksQuery(weddingSlug: string, initialData: WeddingTasksBoardTask[]) {
  return useQuery({
    queryKey: tasksQueryKey(weddingSlug),
    queryFn: () => fetchTasks(weddingSlug),
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

export function useInvalidateTasks(weddingSlug: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tasksQueryKey(weddingSlug) });
}
