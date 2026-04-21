/** Minimal task fields for “my work on this wedding” consolidation (employee portal). */
export type TaskUserScopeRow = {
  assignee_user_id: string | null;
  raised_by_user_id: string | null;
};

/**
 * Tasks that belong in an employee’s consolidated view: assigned to them, or they
 * raised them (including delegating to others or moving to needs_review for admin).
 */
export function taskTouchesWorkspaceUser(task: TaskUserScopeRow, userId: string): boolean {
  if (task.assignee_user_id === userId) return true;
  if (task.raised_by_user_id === userId) return true;
  return false;
}
