-- Restore the site's content to the MDP (major deployment point) snapshot in schema `mdp`.
--
-- Puts back: programmes, news stories, gallery albums and photos, board members, page text,
-- site settings (contact details, bank accounts, homepage, site status), media library
-- entries and email wording.
--
-- Leaves alone, on purpose: the team (admins and their sign-ins), newsletter subscribers
-- (so nobody who unsubscribed is added back), inbox messages, newsletters, the email set-up
-- password, and the logs. Their MDP copies are in mdp.* for reference only.
--
-- Safe to run more than once. Columns added after MDP keep their defaults; columns removed
-- since are skipped. Run in Supabase → SQL Editor, then redeploy the MDP code in Vercel so
-- every page is rebuilt from the restored content (see docs/MDP.md).

begin;

create or replace function pg_temp.copy_back(t text, src text default null) returns void
language plpgsql as $$
declare cols text;
begin
  select string_agg(quote_ident(c.column_name), ', ' order by c.ordinal_position) into cols
  from information_schema.columns c
  join information_schema.columns m on m.table_schema = 'mdp' and m.table_name = t and m.column_name = c.column_name
  where c.table_schema = 'public' and c.table_name = t
    and c.is_generated = 'NEVER' and c.identity_generation is distinct from 'ALWAYS';
  execute format('insert into public.%I (%s) select %s from %s', t, cols, cols, coalesce(src, format('mdp.%I', t)));
end $$;

-- Children first, then parents.
delete from public.photos;
delete from public.albums;
delete from public.articles;
delete from public.programmes;
delete from public.people;
delete from public.page_content;
delete from public.email_templates;
delete from public.media;
delete from public.site_settings;

select pg_temp.copy_back('site_settings');
select pg_temp.copy_back('programmes');
select pg_temp.copy_back('articles');
select pg_temp.copy_back('albums');
select pg_temp.copy_back('photos');
select pg_temp.copy_back('people');
select pg_temp.copy_back('page_content');
select pg_temp.copy_back('email_templates');
-- Uploads by team members who have since been removed lose their "uploaded by" link only.
create temp table mdp_media on commit drop as table mdp.media;
update mdp_media set created_by = null where created_by is not null and created_by not in (select id from auth.users);
select pg_temp.copy_back('media', 'mdp_media');

commit;

select 'restored from MDP taken ' || taken_at as result from mdp.info;
