create or replace function public.create_wedding_with_events(
  p_bride_name text,
  p_groom_name text,
  p_city text default null,
  p_venue_name text default null,
  p_wedding_date date default null,
  p_cultures text[] default '{}'::text[],
  p_total_budget_paise bigint default 0,
  p_slug text default null,
  p_events jsonb default '[]'::jsonb
)
returns table (id uuid, slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_wedding_id uuid;
  v_slug text;
  v_event jsonb;
begin
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = '28000';
  end if;

  insert into public.profiles (id, role)
  values (v_user_id, 'planner')
  on conflict (id) do nothing;

  v_slug := coalesce(nullif(p_slug, ''), 'wedding-' || substring(gen_random_uuid()::text from 1 for 8));

  insert into public.weddings (
    slug,
    creator_id,
    bride_name,
    groom_name,
    couple_name,
    city,
    venue_name,
    wedding_date,
    cultures,
    total_budget_paise,
    status
  ) values (
    v_slug,
    v_user_id,
    trim(p_bride_name),
    trim(p_groom_name),
    trim(p_bride_name) || ' & ' || trim(p_groom_name),
    nullif(trim(p_city), ''),
    nullif(trim(p_venue_name), ''),
    p_wedding_date,
    coalesce(p_cultures, '{}'::text[]),
    greatest(coalesce(p_total_budget_paise, 0), 0),
    'upcoming'
  )
  returning weddings.id, weddings.slug into v_wedding_id, v_slug;

  if jsonb_typeof(p_events) = 'array' then
    for v_event in select value from jsonb_array_elements(p_events)
    loop
      if nullif(trim(coalesce(v_event ->> 'title', '')), '') is not null then
        insert into public.wedding_events (wedding_id, title, event_date, culture_label)
        values (
          v_wedding_id,
          trim(v_event ->> 'title'),
          nullif(v_event ->> 'eventDate', '')::date,
          nullif(trim(coalesce(v_event ->> 'cultureLabel', '')), '')
        );
      end if;
    end loop;
  end if;

  return query select v_wedding_id, v_slug;
end;
$$;

grant execute on function public.create_wedding_with_events(
  text,
  text,
  text,
  text,
  date,
  text[],
  bigint,
  text,
  jsonb
) to authenticated;
