-- Split full_name into first_name/last_name, add business_name and phone
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists business_name text,
  add column if not exists phone text;

-- Migrate existing full_name data into first_name / last_name
update public.profiles
set
  first_name = split_part(full_name, ' ', 1),
  last_name  = nullif(trim(substring(full_name from position(' ' in full_name))), '')
where full_name is not null
  and first_name is null;

-- Drop old column
alter table public.profiles drop column if exists full_name;

-- Recreate the trigger function to use the new fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, business_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'role', 'couple')
  );
  return new;
end;
$$;
