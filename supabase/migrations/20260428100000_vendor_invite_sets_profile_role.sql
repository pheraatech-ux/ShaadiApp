-- When a vendor invite is claimed, set the profile role to 'vendor'.
-- For new signups via the vendor invite form, raw_user_meta_data now carries
-- role='vendor' so the handle_new_user trigger already sets it correctly.
-- This RPC update covers existing accounts (already have a profiles row)
-- that claim an invite after the fact.

create or replace function public.claim_vendor_invite(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text,
  p_user_phone text default null
)
returns table (
  result text,
  vendor_id uuid,
  owner_user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.vendor_invites%rowtype;
  vendor_row public.vendors%rowtype;
  email_match boolean := false;
  phone_match boolean := false;
  normalized_user_phone text;
  normalized_invite_phone text;
begin
  select *
  into invite_row
  from public.vendor_invites
  where token_hash = p_token_hash
  order by created_at desc
  limit 1
  for update;

  if not found then
    return query select 'invalid', null::uuid, null::uuid;
    return;
  end if;

  select *
  into vendor_row
  from public.vendors
  where id = invite_row.vendor_id
  for update;

  if not found then
    return query select 'invalid', null::uuid, null::uuid;
    return;
  end if;

  if invite_row.revoked_at is not null then
    return query select 'revoked', vendor_row.id, invite_row.owner_user_id;
    return;
  end if;

  if invite_row.claimed_at is not null then
    return query select 'claimed', vendor_row.id, invite_row.owner_user_id;
    return;
  end if;

  if invite_row.expires_at <= now() then
    return query select 'expired', vendor_row.id, invite_row.owner_user_id;
    return;
  end if;

  if vendor_row.email is not null and p_user_email is not null then
    email_match := lower(trim(vendor_row.email)) = lower(trim(p_user_email));
  end if;

  normalized_user_phone := nullif(regexp_replace(coalesce(p_user_phone, ''), '[^0-9+]', '', 'g'), '');
  normalized_invite_phone := nullif(regexp_replace(coalesce(vendor_row.phone, ''), '[^0-9+]', '', 'g'), '');
  if normalized_user_phone is not null and normalized_invite_phone is not null then
    phone_match := normalized_user_phone = normalized_invite_phone;
  end if;

  if not email_match and not phone_match then
    return query select 'identity_mismatch', vendor_row.id, invite_row.owner_user_id;
    return;
  end if;

  update public.vendor_invites
  set claimed_at = now(),
      claimed_by_user_id = p_user_id
  where id = invite_row.id
    and claimed_at is null
    and revoked_at is null
    and expires_at > now();

  if not found then
    return query select 'claimed', vendor_row.id, invite_row.owner_user_id;
    return;
  end if;

  update public.vendors
  set user_id = p_user_id,
      invite_status = 'active',
      invited_at = coalesce(invited_at, now())
  where id = vendor_row.id;

  update public.profiles
  set role = 'vendor'
  where id = p_user_id;

  return query select 'accepted', vendor_row.id, invite_row.owner_user_id;
end;
$$;
