-- Sync persona into JWT app_metadata when company_employees changes.
-- Eliminates the company_employees SELECT query in middleware and every server-component render.

create or replace function public.sync_employee_persona()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_is_employee boolean;
begin
  v_user_id := coalesce(
    case when tg_op != 'DELETE' then new.user_id else null end,
    old.user_id
  );

  if v_user_id is null then
    return coalesce(new, old);
  end if;

  -- After the triggering operation, check if this user still has an employee row
  -- under a different owner (AFTER trigger so the mutation has already applied).
  select exists (
    select 1
    from public.company_employees
    where user_id = v_user_id
      and owner_user_id != v_user_id
  ) into v_is_employee;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('persona', case when v_is_employee then 'employee' else 'planner' end)
  where id = v_user_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_employee_persona on public.company_employees;
create trigger trg_sync_employee_persona
after insert or update or delete
on public.company_employees
for each row execute function public.sync_employee_persona();

-- Backfill: mark existing employees
update auth.users u
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"persona": "employee"}'::jsonb
where u.id in (
  select distinct ce.user_id
  from public.company_employees ce
  where ce.user_id is not null
    and ce.owner_user_id != ce.user_id
);

-- Backfill: all other authenticated users default to planner
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"persona": "planner"}'::jsonb
where (raw_app_meta_data->>'persona') is null;
