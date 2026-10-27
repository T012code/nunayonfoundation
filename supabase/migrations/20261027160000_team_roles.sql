-- Team roles, round two.
-- - Admins have every permission and can manage the team and email set-up, like the super
--   admin, except that nobody can change or remove the super admin.
-- - Up to 3 active people per role (admin, editor, communications); one super admin.
-- - Admins always sign in with an authenticator app, since they can manage other people.

-- Admins must use MFA (existing admins are switched on).
update public.admins set mfa_required = true where role = 'admin' and not mfa_required;
alter table public.admins
  add constraint admin_requires_mfa check (role <> 'admin' or mfa_required);

-- Super admin or admin, in an MFA-verified session.
create or replace function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.active and a.role in ('super_admin', 'admin')
      and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
  )
$$;
revoke all on function private.is_manager() from public;
grant execute on function private.is_manager() to authenticated;

-- Admins hold every content permission, like the super admin.
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
      and (a.role in ('super_admin', 'admin') or perm = any (a.permissions))
  )
$$;

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
      then to_jsonb(array['news', 'gallery', 'programmes', 'people', 'inbox', 'newsletter', 'settings', 'activity'])
      else to_jsonb(a.permissions) end,
    'mfa_required', a.mfa_required,
    'aal', coalesce((select auth.jwt()) ->> 'aal', 'aal1')
  )
  from public.admins a
  where a.user_id = (select auth.uid()) and a.active
$$;

-- Up to three active people in each role.
create or replace function private.limit_admins()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role <> 'super_admin' and new.active and (
    select count(*) from public.admins a
    where a.role = new.role and a.active and a.id <> new.id
  ) >= 3 then
    raise exception 'There can be at most 3 people with this role. Change someone else''s role first.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- The super admin's record can't be removed, switched off, demoted or moved to another
-- email by anyone, whatever the route (admin pages, API or the secret key). Only the name
-- (and the sign-in link) can change.
create or replace function private.protect_super()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'super_admin' then
      raise exception 'The super admin can''t be removed.' using errcode = '42501';
    end if;
    return old;
  end if;
  if old.role = 'super_admin' and (
    new.role <> old.role or not new.active or new.email <> old.email
    or new.permissions <> old.permissions or not new.mfa_required
  ) then
    raise exception 'The super admin''s access can''t be changed.' using errcode = '42501';
  end if;
  if new.role = 'super_admin' and old.role <> 'super_admin' then
    raise exception 'There is only one super admin.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger admins_protect_super before update or delete on public.admins
  for each row execute function private.protect_super();

-- Team table: managers (super admin and admins) see and manage everyone; admins can't touch
-- the super admin's record, and only the super admin can rename themselves.
drop policy admins_select on public.admins;
drop policy admins_insert on public.admins;
drop policy admins_update on public.admins;
drop policy admins_delete on public.admins;

create policy admins_select on public.admins for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_manager()));
create policy admins_insert on public.admins for insert to authenticated
  with check ((select private.is_manager()) and role <> 'super_admin');
create policy admins_update on public.admins for update to authenticated
  using (
    (role <> 'super_admin' and (select private.is_manager()))
    or (role = 'super_admin' and (select private.is_super()))
  )
  with check (
    (role <> 'super_admin' and (select private.is_manager()))
    or (role = 'super_admin' and (select private.is_super()))
  );
create policy admins_delete on public.admins for delete to authenticated
  using ((select private.is_manager()) and role <> 'super_admin');

-- Email set-up: managers.
drop policy mail_settings_select on public.mail_settings;
drop policy mail_settings_update on public.mail_settings;
create policy mail_settings_select on public.mail_settings for select to authenticated
  using ((select private.is_manager()));
create policy mail_settings_update on public.mail_settings for update to authenticated
  using ((select private.is_manager())) with check ((select private.is_manager()));

create or replace function public.set_smtp_password(new_password text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing uuid;
begin
  if not private.is_manager() then
    raise exception 'Only the super admin and admins can change the email password' using errcode = '42501';
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
