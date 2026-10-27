-- Newsletter links (confirm, unsubscribe, resubscribe) that work from the public site without
-- the server's secret key. Each needs the subscriber's secret token from their email, and
-- returns no more than a partly hidden address.

create or replace function public.newsletter_lookup(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'email', left(split_part(s.email, '@', 1), 1) || '•••@' || split_part(s.email, '@', 2),
    'status', s.status
  )
  from public.subscribers s
  where s.token = p_token
$$;

create or replace function public.newsletter_unsubscribe(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with done as (
    update public.subscribers
    set status = 'unsubscribed', unsubscribed_at = coalesce(unsubscribed_at, now())
    where token = p_token
    returning 1
  )
  select exists (select 1 from done)
$$;

-- Back on the list: they confirmed their address before, and the token proves it's theirs.
create or replace function public.newsletter_resubscribe(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with done as (
    update public.subscribers
    set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now()), unsubscribed_at = null
    where token = p_token and status = 'unsubscribed'
    returning 1
  )
  select exists (select 1 from done)
$$;

create or replace function public.newsletter_confirm(p_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with done as (
    update public.subscribers
    set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now()), unsubscribed_at = null
    where token = p_token
    returning 1
  )
  select exists (select 1 from done)
$$;

revoke all on function public.newsletter_lookup(uuid), public.newsletter_unsubscribe(uuid),
  public.newsletter_resubscribe(uuid), public.newsletter_confirm(uuid) from public;
grant execute on function public.newsletter_lookup(uuid), public.newsletter_unsubscribe(uuid),
  public.newsletter_resubscribe(uuid), public.newsletter_confirm(uuid) to anon, authenticated, service_role;
