-- Stories the team picks for the home page (up to five; the newest fill any gaps).
alter table public.articles add column featured boolean not null default false;
create index articles_featured_idx on public.articles (published_at desc) where featured and published;
