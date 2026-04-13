do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'task_status'
      and e.enumlabel = 'needs_review'
  ) then
    alter type public.task_status add value 'needs_review';
  end if;
end
$$;
