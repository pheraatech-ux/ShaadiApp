alter table public.tasks
  add column if not exists assignee_user_ids uuid[] not null default '{}';

-- Migrate existing single assignee values into the new array column
update public.tasks
set assignee_user_ids = array[assignee_user_id]
where assignee_user_id is not null
  and array_length(assignee_user_ids, 1) is null;
