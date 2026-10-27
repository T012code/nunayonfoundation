-- Page text edited in the admin (Content › Pages). One row per page; the site falls back to
-- the text in the code for anything not saved here.

create table public.page_content (
  slug text primary key check (slug ~ '^[a-z]+$'),
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.page_content enable row level security;

create trigger page_content_touch before update on public.page_content
  for each row execute function private.touch_updated_at();
create trigger page_content_log after insert or update or delete on public.page_content
  for each row execute function private.log_change();

-- New permission: edit page text.
alter table public.admins drop constraint known_permissions;
alter table public.admins add constraint known_permissions check (
  permissions <@ array['news', 'gallery', 'programmes', 'people', 'inbox', 'newsletter', 'settings', 'activity', 'pages']
);

create policy page_content_public on public.page_content for select to anon using (true);
create policy page_content_team_select on public.page_content for select to authenticated using (true);
create policy page_content_team_insert on public.page_content for insert to authenticated
  with check ((select private.can('pages')));
create policy page_content_team_update on public.page_content for update to authenticated
  using ((select private.can('pages'))) with check ((select private.can('pages')));
create policy page_content_team_delete on public.page_content for delete to authenticated
  using ((select private.can('pages')));
revoke all on public.page_content from anon, authenticated;
grant select on public.page_content to anon, authenticated;
grant insert, update, delete on public.page_content to authenticated;

-- Page text counts as content for media uploads.
create or replace function private.can_edit_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can('news') or private.can('gallery') or private.can('programmes') or private.can('people')
    or private.can('settings') or private.can('pages')
$$;

-- Super admin and admins hold every permission, including the new one.
create or replace function public.my_access()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id,
    'email', a.email,
    'name', a.name,
    'role', a.role,
    'permissions', case when a.role in ('super_admin', 'admin')
      then to_jsonb(array['news', 'gallery', 'programmes', 'people', 'inbox', 'newsletter', 'settings', 'activity', 'pages'])
      else to_jsonb(a.permissions) end,
    'mfa_required', a.mfa_required,
    'aal', coalesce((select auth.jwt()) ->> 'aal', 'aal1')
  )
  from public.admins a
  where a.user_id = (select auth.uid()) and a.active
$$;

-- Editors already on the team get the new permission, as new editors will.
update public.admins set permissions = array_append(permissions, 'pages')
where role in ('editor', 'communications') and not ('pages' = any (permissions));
