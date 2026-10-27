-- Newsletter scheduler: every 5 minutes, if a newsletter is due or part-way through sending,
-- call the site's /api/cron/newsletter endpoint, which sends the next batches.
--
-- The site address and the endpoint's secret live in Vault. The secret is generated here and
-- never written in code; the same value is set as CRON_SECRET in Vercel. When the site moves
-- to its own domain, update the address:
--   select vault.update_secret((select id from vault.secrets where name = 'site_url'), 'https://www.nunayonfoundation.org');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'cron_secret', 'Bearer token for /api/cron/newsletter')
where not exists (select 1 from vault.secrets where name = 'cron_secret');
select vault.create_secret('https://nunayonfoundation.vercel.app', 'site_url', 'Public site address used by scheduled jobs')
where not exists (select 1 from vault.secrets where name = 'site_url');

create or replace function private.kick_newsletter()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  token text;
begin
  if not exists (
    select 1 from public.campaigns
    where status = 'sending' or (status = 'scheduled' and scheduled_at <= now())
  ) then
    return;
  end if;
  select decrypted_secret into base from vault.decrypted_secrets where name = 'site_url';
  select decrypted_secret into token from vault.decrypted_secrets where name = 'cron_secret';
  perform net.http_post(
    url := base || '/api/cron/newsletter',
    headers := jsonb_build_object('Authorization', 'Bearer ' || token, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;
revoke all on function private.kick_newsletter() from public, anon, authenticated;

select cron.schedule('newsletter-sender', '*/5 * * * *', $$select private.kick_newsletter()$$);
