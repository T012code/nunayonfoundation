-- Admin foundation: team members and permissions, MFA gate, activity log, editable content,
-- form inbox, newsletter and media storage.
--
-- Access model
-- - Public pages read published content with the publishable key (role anon).
-- - Team members sign in (role authenticated). Every read and write of admin data goes
--   through private.can(permission), which requires an active team member with that
--   permission AND, when their account requires MFA, an MFA-verified session (aal2).
-- - The super admin holds every permission and always requires MFA.
-- - Form submissions, newsletter sign-ups and email sending run on the server with the
--   secret key; the public API cannot write to those tables directly.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ── Team ────────────────────────────────────────────────────────────────────

create type public.admin_role as enum ('super_admin', 'admin', 'editor', 'communications');

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  -- Null until the matching sign-in account exists (linked by email, see trigger below).
  user_id uuid unique references auth.users (id) on delete cascade,
  email text not null unique check (email = lower(email)),
  name text not null default '',
  role public.admin_role not null,
  permissions text[] not null default '{}',
  mfa_required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint super_admin_requires_mfa check (role <> 'super_admin' or (mfa_required and active)),
  constraint known_permissions check (
    permissions <@ array['news', 'gallery', 'programmes', 'people', 'inbox', 'newsletter', 'settings', 'activity']
  )
);
alter table public.admins enable row level security;
create unique index admins_one_super on public.admins (role) where role = 'super_admin';

-- True when the session may act as this team member: MFA-verified if their account requires it.
create or replace function private.session_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.active
      and (not a.mfa_required or coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2')
  )
$$;

create or replace function private.can(perm text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.active
      and (not a.mfa_required or coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2')
      and (a.role = 'super_admin' or perm = any (a.permissions))
  )
$$;

create or replace function private.is_super()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.active and a.role = 'super_admin'
      and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
  )
$$;

-- Any content permission (media uploads are shared by every content section).
create or replace function private.can_edit_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can('news') or private.can('gallery') or private.can('programmes') or private.can('people') or private.can('settings')
$$;

revoke all on function private.session_ok(), private.can(text), private.is_super(), private.can_edit_content() from public;
grant execute on function private.session_ok(), private.can(text), private.is_super(), private.can_edit_content() to authenticated;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger admins_touch before update on public.admins
  for each row execute function private.touch_updated_at();

-- At most three full admins (besides the super admin).
create or replace function private.limit_admins()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'admin' and new.active and (
    select count(*) from public.admins a
    where a.role = 'admin' and a.active and a.id <> new.id
  ) >= 3 then
    raise exception 'There can be at most 3 admins. Change another admin''s role first.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger admins_limit before insert or update on public.admins
  for each row execute function private.limit_admins();

-- Link a team member to their sign-in account by email, whichever is created first.
create or replace function private.link_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.admins set user_id = new.id
  where email = lower(new.email) and user_id is null;
  return new;
end;
$$;

create trigger on_auth_user_link_admin after insert on auth.users
  for each row execute function private.link_admin();

-- Team members see their own record; the super admin sees and manages everyone.
create policy admins_select on public.admins for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_super()));
create policy admins_insert on public.admins for insert to authenticated
  with check ((select private.is_super()) and role <> 'super_admin');
create policy admins_update on public.admins for update to authenticated
  using ((select private.is_super()))
  with check ((select private.is_super()));
create policy admins_delete on public.admins for delete to authenticated
  using ((select private.is_super()) and role <> 'super_admin');

revoke all on public.admins from anon, authenticated;
grant select, insert, update, delete on public.admins to authenticated;

insert into public.admins (email, name, role, mfa_required)
values ('molayokunmi@gmail.com', 'Super admin', 'super_admin', true);
update public.admins a set user_id = u.id
from auth.users u where lower(u.email) = a.email and a.user_id is null;

-- ── Activity log ────────────────────────────────────────────────────────────

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  summary text not null default '',
  created_at timestamptz not null default now()
);
alter table public.activity_log enable row level security;
create index activity_log_created_idx on public.activity_log (created_at desc);
create index activity_log_actor_idx on public.activity_log (actor);

create policy activity_select on public.activity_log for select to authenticated
  using ((select private.can('activity')));
-- Sign-in events and the like: a team member can only write entries in their own name.
create policy activity_insert on public.activity_log for insert to authenticated
  with check (actor = (select auth.uid()) and exists (select 1 from public.admins a where a.user_id = (select auth.uid()) and a.active));

revoke all on public.activity_log from anon, authenticated;
grant select, insert on public.activity_log to authenticated;

-- Records every change to admin-managed tables, with who made it.
create or replace function private.log_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  label text := coalesce(rec ->> 'title', rec ->> 'name', rec ->> 'subject', rec ->> 'email', rec ->> 'slug', '');
  verb text := case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end;
begin
  -- Changes made by the server itself (form submissions, sending) are not team activity.
  if (select auth.uid()) is null then
    return null;
  end if;
  insert into public.activity_log (actor, actor_email, action, entity, entity_id, summary)
  values (
    (select auth.uid()),
    (select auth.jwt()) ->> 'email',
    verb,
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'slug', ''),
    label
  );
  return null;
end;
$$;

-- ── Site settings (one row) ─────────────────────────────────────────────────

create table public.site_settings (
  id boolean primary key default true check (id),
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  address text not null default '',
  -- Where form alerts go. Not shown on the site.
  notify_email text not null default '',
  socials jsonb not null default '[]' check (jsonb_typeof(socials) = 'array'),
  bank_accounts jsonb not null default '[]' check (jsonb_typeof(bank_accounts) = 'array'),
  impact jsonb not null default '[]' check (jsonb_typeof(impact) = 'array'),
  hero jsonb not null default '{}' check (jsonb_typeof(hero) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create trigger admins_log after insert or update or delete on public.admins
  for each row execute function private.log_change();

create trigger site_settings_touch before update on public.site_settings
  for each row execute function private.touch_updated_at();
create trigger site_settings_log after update on public.site_settings
  for each row execute function private.log_change();

create policy site_settings_public on public.site_settings for select to anon using (true);
create policy site_settings_team on public.site_settings for select to authenticated
  using ((select private.session_ok()));
create policy site_settings_update on public.site_settings for update to authenticated
  using ((select private.can('settings'))) with check ((select private.can('settings')));

revoke all on public.site_settings from anon, authenticated;
grant select (id, email, phone, whatsapp, address, socials, bank_accounts, impact, hero, updated_at)
  on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;
insert into public.site_settings (id) values (true);

-- ── Content ─────────────────────────────────────────────────────────────────
-- Image fields hold an image reference: a placeholder name (JSON string) or an uploaded
-- photo's details (JSON object), so pages can render them without another lookup.

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  intro text not null default '',
  image jsonb,
  covers text[] not null default '{}',
  steps jsonb not null default '[]',
  stat jsonb not null default '{}',
  photos jsonb not null default '[]',
  sort integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  image jsonb,
  photos jsonb not null default '[]',
  programme text references public.programmes (slug) on update cascade on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
create index articles_published_idx on public.articles (published_at desc) where published;
create index articles_programme_idx on public.articles (programme);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  sort integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  image jsonb not null,
  caption text not null default '',
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);
create index photos_album_idx on public.photos (album_id, sort);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  bio text not null default '',
  image jsonb,
  sort integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Uploaded photos: one row per upload; files live in the media bucket as {id}-{width}.webp.
create table public.media (
  id uuid primary key default gen_random_uuid(),
  width integer not null,
  height integer not null,
  sizes integer[] not null,
  bytes integer not null default 0,
  blur text not null default '',
  alt text not null default '',
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index media_created_by_idx on public.media (created_by);

do $$
declare
  t text;
  perm text;
begin
  for t, perm in
    select * from (values
      ('programmes', 'programmes'), ('articles', 'news'), ('albums', 'gallery'),
      ('photos', 'gallery'), ('people', 'people')
    ) v(t, perm)
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()', t || '_touch', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.log_change()', t || '_log', t);
    -- Public pages see published rows only (photos follow their album).
    if t = 'photos' then
      execute 'create policy photos_public on public.photos for select to anon
        using (exists (select 1 from public.albums al where al.id = album_id and al.published))';
    else
      execute format('create policy %I on public.%I for select to anon using (published)', t || '_public', t);
    end if;
    execute format('create policy %I on public.%I for select to authenticated using ((select private.can(%L)))', t || '_team_select', t, perm);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select private.can(%L)))', t || '_team_insert', t, perm);
    execute format('create policy %I on public.%I for update to authenticated using ((select private.can(%L))) with check ((select private.can(%L)))', t || '_team_update', t, perm, perm);
    execute format('create policy %I on public.%I for delete to authenticated using ((select private.can(%L)))', t || '_team_delete', t, perm);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

alter table public.media enable row level security;
create policy media_select on public.media for select to authenticated using ((select private.can_edit_content()));
create policy media_insert on public.media for insert to authenticated with check ((select private.can_edit_content()));
create policy media_delete on public.media for delete to authenticated using ((select private.can_edit_content()));
revoke all on public.media from anon, authenticated;
grant select, insert, delete on public.media to authenticated;

-- Public bucket: files are fetched by URL; only content editors can upload or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy media_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.can_edit_content()));
create policy media_files_select on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.can_edit_content()));
create policy media_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.can_edit_content()));

-- ── Form inbox ──────────────────────────────────────────────────────────────

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'partner', 'volunteer', 'donation')),
  name text not null,
  email text not null,
  phone text not null default '',
  -- Remaining form fields, as label/value pairs in form order.
  fields jsonb not null default '[]' check (jsonb_typeof(fields) = 'array'),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);
alter table public.submissions enable row level security;
create index submissions_inbox_idx on public.submissions (status, created_at desc);

create policy submissions_select on public.submissions for select to authenticated using ((select private.can('inbox')));
create policy submissions_update on public.submissions for update to authenticated
  using ((select private.can('inbox'))) with check ((select private.can('inbox')));
create policy submissions_delete on public.submissions for delete to authenticated using ((select private.can('inbox')));
revoke all on public.submissions from anon, authenticated;
grant select, update (status), delete on public.submissions to authenticated;
create trigger submissions_log after update or delete on public.submissions
  for each row execute function private.log_change();

-- ── Newsletter ──────────────────────────────────────────────────────────────

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  -- Secret in confirm and unsubscribe links.
  token uuid not null default gen_random_uuid() unique,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);
alter table public.subscribers enable row level security;
create index subscribers_status_idx on public.subscribers (status);
create policy subscribers_select on public.subscribers for select to authenticated using ((select private.can('newsletter')));
create policy subscribers_delete on public.subscribers for delete to authenticated using ((select private.can('newsletter')));
revoke all on public.subscribers from anon, authenticated;
grant select (id, email, status, source, created_at, confirmed_at, unsubscribed_at), delete on public.subscribers to authenticated;
create trigger subscribers_log after delete on public.subscribers
  for each row execute function private.log_change();

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preheader text not null default '',
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent')),
  scheduled_at timestamptz,
  started_at timestamptz,
  sent_at timestamptz,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create index campaigns_created_by_idx on public.campaigns (created_by);
create trigger campaigns_touch before update on public.campaigns
  for each row execute function private.touch_updated_at();
create trigger campaigns_log after insert or update or delete on public.campaigns
  for each row execute function private.log_change();
create policy campaigns_select on public.campaigns for select to authenticated using ((select private.can('newsletter')));
create policy campaigns_insert on public.campaigns for insert to authenticated with check ((select private.can('newsletter')));
-- Only drafts and scheduled campaigns can be edited; sending is done by the server.
create policy campaigns_update on public.campaigns for update to authenticated
  using ((select private.can('newsletter')) and status in ('draft', 'scheduled'))
  with check ((select private.can('newsletter')) and status in ('draft', 'scheduled'));
create policy campaigns_delete on public.campaigns for delete to authenticated
  using ((select private.can('newsletter')) and status in ('draft', 'scheduled'));
revoke all on public.campaigns from anon, authenticated;
grant select, insert, delete on public.campaigns to authenticated;
grant update (subject, preheader, body, status, scheduled_at) on public.campaigns to authenticated;

create table public.campaign_recipients (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  error text not null default '',
  sent_at timestamptz,
  primary key (campaign_id, subscriber_id)
);
alter table public.campaign_recipients enable row level security;
create index campaign_recipients_queue_idx on public.campaign_recipients (campaign_id, status);
create index campaign_recipients_subscriber_idx on public.campaign_recipients (subscriber_id);
create policy campaign_recipients_select on public.campaign_recipients for select to authenticated using ((select private.can('newsletter')));
revoke all on public.campaign_recipients from anon, authenticated;
grant select on public.campaign_recipients to authenticated;

-- ── Outgoing email (SMTP) ───────────────────────────────────────────────────
-- Connection details are visible to the super admin; the password lives in Vault and is
-- only readable by the server.

create table public.mail_settings (
  id boolean primary key default true check (id),
  provider text not null default 'gmail' check (provider in ('gmail', 'microsoft365', 'zoho', 'other')),
  host text not null default '',
  port integer not null default 465,
  secure boolean not null default true,
  username text not null default '',
  from_name text not null default 'Nunayon Foundation',
  from_email text not null default '',
  reply_to text not null default '',
  has_password boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.mail_settings enable row level security;
create trigger mail_settings_touch before update on public.mail_settings
  for each row execute function private.touch_updated_at();
create trigger mail_settings_log after update on public.mail_settings
  for each row execute function private.log_change();
create policy mail_settings_select on public.mail_settings for select to authenticated using ((select private.is_super()));
create policy mail_settings_update on public.mail_settings for update to authenticated
  using ((select private.is_super())) with check ((select private.is_super()));
revoke all on public.mail_settings from anon, authenticated;
grant select on public.mail_settings to authenticated;
grant update (provider, host, port, secure, username, from_name, from_email, reply_to) on public.mail_settings to authenticated;
insert into public.mail_settings (id) values (true);

create or replace function public.set_smtp_password(new_password text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing uuid;
begin
  if not private.is_super() then
    raise exception 'Only the super admin can change the email password' using errcode = '42501';
  end if;
  select id into existing from vault.secrets where name = 'smtp_password';
  if existing is null then
    perform vault.create_secret(new_password, 'smtp_password', 'SMTP password for outgoing email');
  else
    perform vault.update_secret(existing, new_password);
  end if;
  update public.mail_settings set has_password = true where id;
end;
$$;
revoke all on function public.set_smtp_password(text) from public, anon;
grant execute on function public.set_smtp_password(text) to authenticated;

create or replace function public.get_smtp_password()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'smtp_password'
$$;
revoke all on function public.get_smtp_password() from public, anon, authenticated;
grant execute on function public.get_smtp_password() to service_role;

-- ── Dashboard helper ────────────────────────────────────────────────────────

-- The signed-in team member's own record and whether this session has passed MFA.
create or replace function public.my_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id,
    'email', a.email,
    'name', a.name,
    'role', a.role,
    'permissions', case when a.role = 'super_admin'
      then to_jsonb(array['news', 'gallery', 'programmes', 'people', 'inbox', 'newsletter', 'settings', 'activity'])
      else to_jsonb(a.permissions) end,
    'mfa_required', a.mfa_required,
    'aal', coalesce((select auth.jwt()) ->> 'aal', 'aal1')
  )
  from public.admins a
  where a.user_id = (select auth.uid()) and a.active
$$;
revoke all on function public.my_access() from public, anon;
grant execute on function public.my_access() to authenticated;
