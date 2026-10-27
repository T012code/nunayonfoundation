import "server-only";
import type { ImageRef, MediaRef } from "@/content/images";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MediaRow = {
  id: string;
  width: number;
  height: number;
  sizes: number[];
  bytes: number;
  blur: string;
  alt: string;
  format: "webp" | "jpg";
  name: string;
  created_at: string;
};

export const toRef = (m: MediaRow): MediaRef => ({
  id: m.id,
  w: m.width,
  h: m.height,
  sizes: m.sizes,
  blur: m.blur,
  alt: m.alt,
  ext: m.format,
});

export type Usage = { label: string; href: string };

const refId = (r: unknown) => (r && typeof r === "object" && "id" in r ? String((r as MediaRef).id) : null);

/**
 * Where each uploaded photo is used, so the library can show it and refuse to delete a photo
 * that's still on the site. Content is small, so it's read in full.
 */
export async function mediaUsage(db: SupabaseClient) {
  const [programmes, articles, photos, people, settings] = await Promise.all([
    db.from("programmes").select("id, title, image, photos"),
    db.from("articles").select("id, title, image, photos"),
    db.from("photos").select("id, image, album_id, albums(title)"),
    db.from("people").select("id, name, image"),
    db.from("site_settings").select("hero").maybeSingle(),
  ]);
  const map = new Map<string, Usage[]>();
  const add = (ref: unknown, use: Usage) => {
    const id = refId(ref);
    if (!id) return;
    const list = map.get(id) ?? [];
    if (!list.some((u) => u.label === use.label)) list.push(use);
    map.set(id, list);
  };
  for (const p of programmes.data ?? []) {
    const use = { label: `Programme: ${p.title}`, href: `/admin/programmes/${p.id}` };
    add(p.image, use);
    (p.photos as ImageRef[]).forEach((r) => add(r, use));
  }
  for (const a of articles.data ?? []) {
    const use = { label: `Story: ${a.title}`, href: `/admin/news/${a.id}` };
    add(a.image, use);
    (a.photos as ImageRef[]).forEach((r) => add(r, use));
  }
  for (const ph of photos.data ?? []) {
    const album = (ph.albums as unknown as { title: string } | null)?.title ?? "album";
    add(ph.image, { label: `Gallery: ${album}`, href: `/admin/gallery/${ph.album_id}` });
  }
  for (const pe of people.data ?? []) add(pe.image, { label: `People: ${pe.name}`, href: `/admin/people` });
  for (const r of ((settings.data?.hero as { slides?: ImageRef[] })?.slides ?? [])) {
    add(r, { label: "Home page slideshow", href: "/admin/settings#home" });
  }
  return map;
}
