-- Keep each logged email's content so it can be resent, and let managers delete entries.
alter table public.email_log
  add column html text not null default '',
  add column text_body text not null default '',
  add column reply_to text not null default '';
create policy email_log_delete on public.email_log for delete to authenticated
  using ((select private.is_manager()));
grant delete on public.email_log to authenticated;

-- How long each log is kept, set in Admin → Settings.
alter table public.site_settings
  add column activity_log_days int not null default 14 check (activity_log_days between 1 and 3650),
  add column email_log_days int not null default 90 check (email_log_days between 1 and 3650);

select cron.unschedule('activity-log-retention');
select cron.unschedule('email-log-retention');
select cron.schedule(
  'activity-log-retention',
  '43 2 * * *',
  $$delete from public.activity_log
    where created_at < now() - make_interval(days => coalesce((select activity_log_days from public.site_settings limit 1), 14))$$
);
select cron.schedule(
  'email-log-retention',
  '51 2 * * *',
  $$delete from public.email_log
    where created_at < now() - make_interval(days => coalesce((select email_log_days from public.site_settings limit 1), 90))$$
);
