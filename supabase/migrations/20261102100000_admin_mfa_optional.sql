-- An authenticator app is now optional for admins (set per person on the Team page). The super
-- admin still always uses one: their record keeps mfa_required, which nobody can switch off.

alter table public.admins drop constraint if exists admin_requires_mfa;

-- Super admin or admin, in a session that meets their own authenticator setting.
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
      and (not a.mfa_required or coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2')
  )
$$;

update public.admins set mfa_required = false
where role = 'admin' and email in ('adedamolamarian2227@gmail.com', 'ojonugwafidelia@gmail.com', 'modupeolaoluwakemi3@gmail.com');
