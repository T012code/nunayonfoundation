import "server-only";
import { cache } from "react";
import { about, albums as albumsSeed, type Album, type Person } from "@/content/pages";
import type { ImageRef } from "@/content/images";
import {
  articles as articlesSeed,
  bank,
  hero as heroSeed,
  impact as impactSeed,
  programmes as programmesSeed,
  site,
  type Article,
  type BankAccount,
  type Programme,
  type Social,
  type Stat,
} from "@/content/site";
import { publicClient } from "@/lib/supabase/server";

// Everything the admin can edit is read here. Pages are built ahead of time and rebuilt
// when an admin saves, so visitors never wait on the database. If it can't be reached
// (for example in a build without network), the built-in placeholder content is used.

export type Settings = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socials: Social[];
  bankAccounts: BankAccount[];
  impact: Stat[];
  hero: { title: string; lead: string; slides: ImageRef[] };
};

const fallbackSettings: Settings = {
  name: site.name,
  email: site.email,
  phone: site.phone,
  whatsapp: site.whatsapp,
  address: site.address,
  socials: site.socials,
  bankAccounts: bank.accounts,
  impact: impactSeed.stats,
  hero: heroSeed,
};

async function attempt<T>(what: string, run: () => PromiseLike<{ data: unknown; error: unknown }>, fallback: T): Promise<T> {
  try {
    const { data, error } = await run();
    if (error || data === null) throw error ?? new Error("no data");
    return data as T;
  } catch (error) {
    console.error(`[content] ${what}: using placeholder content`, error);
    return fallback;
  }
}

type SettingsRow = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socials: Social[];
  bank_accounts: BankAccount[];
  impact: Stat[];
  hero: Partial<Settings["hero"]>;
};

export const getSettings = cache(async (): Promise<Settings> => {
  const row = await attempt<SettingsRow | null>(
    "settings",
    () =>
      publicClient()
        .from("site_settings")
        .select("email, phone, whatsapp, address, socials, bank_accounts, impact, hero")
        .maybeSingle(),
    null,
  );
  if (!row) return fallbackSettings;
  return {
    name: site.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    socials: row.socials,
    bankAccounts: row.bank_accounts,
    impact: row.impact,
    hero: {
      title: row.hero.title || heroSeed.title,
      lead: row.hero.lead || heroSeed.lead,
      slides: row.hero.slides?.length ? row.hero.slides : heroSeed.slides,
    },
  };
});

export const getProgrammes = cache(async (): Promise<Programme[]> => {
  const rows = await attempt<Programme[] | null>(
    "programmes",
    () =>
      publicClient()
        .from("programmes")
        .select("slug, title, summary, intro, image, covers, steps, stat, photos")
        .order("sort")
        .order("title"),
    null,
  );
  return rows ?? programmesSeed;
});

type ArticleRow = Omit<Article, "body" | "date"> & { body: string; published_at: string | null };

export const getArticles = cache(async (): Promise<Article[]> => {
  const rows = await attempt<ArticleRow[] | null>(
    "articles",
    () =>
      publicClient()
        .from("articles")
        .select("slug, title, excerpt, body, image, photos, programme, published_at")
        .order("published_at", { ascending: false, nullsFirst: false }),
    null,
  );
  if (!rows) return articlesSeed;
  return rows.map(({ body, published_at, programme, ...a }) => ({
    ...a,
    programme: programme ?? "",
    body: body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    date: published_at ?? undefined,
  }));
});

type AlbumRow = { slug: string; title: string; photos: { image: ImageRef; caption: string; sort: number }[] };

export const getAlbums = cache(async (): Promise<Album[]> => {
  const rows = await attempt<AlbumRow[] | null>(
    "albums",
    () =>
      publicClient()
        .from("albums")
        .select("slug, title, photos(image, caption, sort)")
        .order("sort"),
    null,
  );
  if (!rows) return albumsSeed;
  return rows
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      photos: [...a.photos].sort((x, y) => x.sort - y.sort).map(({ image, caption }) => ({ image, caption })),
    }))
    .filter((a) => a.photos.length > 0);
});

export const getPeople = cache(async (): Promise<Person[]> => {
  const rows = await attempt<Person[] | null>(
    "people",
    () => publicClient().from("people").select("name, role, bio, image").order("sort"),
    null,
  );
  return rows ?? about.people;
});
