create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_full_name text;
  first_token text;
begin
  raw_full_name := nullif(
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    ''
  );
  first_token := nullif(split_part(coalesce(raw_full_name, ''), ' ', 1), '');

  insert into public.profiles (id, first_name, last_name, business_name, phone, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'first_name', ''),
      nullif(new.raw_user_meta_data ->> 'given_name', ''),
      first_token
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'last_name', ''),
      nullif(new.raw_user_meta_data ->> 'family_name', ''),
      nullif(trim(substr(coalesce(raw_full_name, ''), length(coalesce(first_token, '')) + 1)), '')
    ),
    nullif(new.raw_user_meta_data ->> 'business_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'couple')
  );
  return new;
end;
$$;
