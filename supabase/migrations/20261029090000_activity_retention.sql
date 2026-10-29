-- Keep the activity log to the last 14 days: a daily job deletes older entries.
select cron.schedule(
  'activity-log-retention',
  '43 2 * * *',
  $$delete from public.activity_log where created_at < now() - interval '14 days'$$
);
