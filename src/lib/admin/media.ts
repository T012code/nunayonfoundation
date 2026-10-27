import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLUMNS } from "@/app/admin/(auth)/columns";
import { BUILTIN_IMAGES, type ImageRef, type MediaRef } from "@/content/images";
import { COPY_PAGES } from "@/content/copy";
import { getCopy } from "@/lib/copy";

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

const BUILTIN = new Set<string>(BUILTIN_IMAGES);

/** The library key for any image: an upload's id, or a built-in photo's name. */
const refId = (r: unknown) =>
  r && typeof r === "object" && "id" in r ? String((r as MediaRef).id) : typeof r === "string" && BUILTIN.has(r) ? r : null;


function eachImage(value: unknown, fn: (ref: unknown) => void) {
  if (typeof value === "string") fn(value);
  else if (Array.isArray(value)) value.forEach((v) => eachImage(v, fn));
  else if (value && typeof value === "object") {
    if ("id" in value && "sizes" in value) fn(value);
    else Object.values(value).forEach((v) => eachImage(v, fn));
  }
}

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
  for (const pe of people.data ?? []) add(pe.image, { label: `Board members: ${pe.name}`, href: `/admin/people` });
  for (const r of ((settings.data?.hero as { slides?: ImageRef[] })?.slides ?? [])) {
    add(r, { label: "Home page slideshow", href: "/admin/homepage" });
  }
  // Photos in page text (Pages), and the sign-in screen's photo wall.
  const pages = await Promise.all(COPY_PAGES.map(async (p) => ({ ...p, content: await getCopy(p.key) })));
  for (const p of pages) eachImage(p.content, (r) => add(r, { label: `Page: ${p.title}`, href: `/admin/pages/${p.key}` }));
  eachImage(COLUMNS, (r) => add(r, { label: "Admin sign-in screen", href: "/admin/login" }));
  return map;
}
