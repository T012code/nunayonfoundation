-- Media library: remember each upload's file format and original name, let editors fix the
-- description (alt text), and accept JPEG for browsers that can't write WebP.

alter table public.media
  add column format text not null default 'webp' check (format in ('webp', 'jpg')),
  add column name text not null default '';

create policy media_update on public.media for update to authenticated
  using ((select private.can_edit_content())) with check ((select private.can_edit_content()));
grant update (alt) on public.media to authenticated;

create trigger media_log after insert or update or delete on public.media
  for each row execute function private.log_change();

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg', 'application/pdf']
where id = 'media';
