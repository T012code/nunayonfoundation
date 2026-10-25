-- Keep-alive: the scheduled GitHub Action (.github/workflows/supabase-keep-alive.yml) calls this
-- twice a week so the free-plan project never counts as inactive and gets paused.
-- It runs a real database query and returns the time; it reads and changes no data.

create or replace function public.keep_alive()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select now();
$$;
revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon;
