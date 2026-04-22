-- Fix trigger: look up real profile name instead of hardcoding 'Owner'
create or replace function public.add_wedding_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
begin
  select nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
  into v_display_name
  from public.profiles
  where id = new.creator_id;

  insert into public.wedding_members (wedding_id, user_id, display_name, role, status)
  values (new.id, new.creator_id, v_display_name, 'owner', 'active')
  on conflict (wedding_id, user_id) do update
    set role = 'owner',
        status = 'active';
  return new;
end;
$$;

-- Backfill existing rows that were set to the placeholder 'Owner'
update public.wedding_members wm
set display_name = nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), '')
from public.profiles p
where wm.user_id = p.id
  and wm.display_name = 'Owner'
  and wm.role = 'owner'
  and nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), '') is not null;
