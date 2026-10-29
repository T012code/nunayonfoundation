-- Editable wording for the site's emails, a log of every email sent, and the site's
-- maintenance / coming-soon switch.

-- ── Email templates ─────────────────────────────────────────────────────────
-- One row per email the site sends (password reset, invitation, form alert…). Empty fields
-- fall back to the built-in wording, so a missing row is never a broken email.
create table public.email_templates (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  subject text not null default '' check (length(subject) <= 200),
  preheader text not null default '' check (length(preheader) <= 200),
  heading text not null default '' check (length(heading) <= 200),
  body text not null default '' check (length(body) <= 6000),
  button text not null default '' check (length(button) <= 60),
  note text not null default '' check (length(note) <= 600),
  updated_at timestamptz not null default now()
);
alter table public.email_templates enable row level security;
create trigger email_templates_touch before update on public.email_templates
  for each row execute function private.touch_updated_at();
create trigger email_templates_log after insert or update or delete on public.email_templates
  for each row execute function private.log_change();

create policy email_templates_select on public.email_templates for select to authenticated
  using ((select private.is_manager()));
create policy email_templates_insert on public.email_templates for insert to authenticated
  with check ((select private.is_manager()));
create policy email_templates_update on public.email_templates for update to authenticated
  using ((select private.is_manager())) with check ((select private.is_manager()));
create policy email_templates_delete on public.email_templates for delete to authenticated
  using ((select private.is_manager()));
revoke all on public.email_templates from anon, authenticated;
grant select, insert, update, delete on public.email_templates to authenticated;

-- ── Email log ───────────────────────────────────────────────────────────────
-- Written by the server (service key) after each send. Newsletter broadcasts are tracked
-- per recipient in campaign_recipients instead, so they don't flood this list.
create table public.email_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null default '',
  to_address text not null default '',
  subject text not null default '',
  status text not null check (status in ('sent', 'failed')),
  error text not null default ''
);
alter table public.email_log enable row level security;
create index email_log_created_idx on public.email_log (created_at desc);
create policy email_log_select on public.email_log for select to authenticated
  using ((select private.is_manager()));
revoke all on public.email_log from anon, authenticated;
grant select on public.email_log to authenticated;

select cron.schedule(
  'email-log-retention',
  '51 2 * * *',
  $$delete from public.email_log where created_at < now() - interval '90 days'$$
);

-- ── Site mode ───────────────────────────────────────────────────────────────
-- live: the normal site. maintenance: a "back soon" page. coming_soon: a launch page.
-- The admin, and the newsletter confirm / unsubscribe links, keep working in every mode.
alter table public.site_settings
  add column site_mode text not null default 'live' check (site_mode in ('live', 'maintenance', 'coming_soon')),
  add column mode_title text not null default '' check (length(mode_title) <= 140),
  add column mode_message text not null default '' check (length(mode_message) <= 600),
  add column mode_until text not null default '' check (length(mode_until) <= 80);
grant select (site_mode, mode_title, mode_message, mode_until) on public.site_settings to anon;

-- Autoresponders can be switched off; other emails are always sent.
alter table public.email_templates add column enabled boolean not null default true;
