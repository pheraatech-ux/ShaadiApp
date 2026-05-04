import { AllTasksWorkspace } from "@/components/app-dashboard/tasks/all-tasks-workspace";
import { getAllTasksBoardView } from "@/lib/data/app-data";

export default async function TasksPage() {
  const view = await getAllTasksBoardView();
  return <AllTasksWorkspace view={view} />;
}
