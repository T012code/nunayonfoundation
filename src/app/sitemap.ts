import type { MetadataRoute } from "next";
import { shareImage, type ImageRef } from "@/content/images";
import { getArticles, getProgrammes } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

const abs = (path: string) => `${SITE_URL}${path}`;
const img = (ref: ImageRef) => shareImage(ref, SITE_URL);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programmes, articles] = await Promise.all([getProgrammes(), getArticles()]);
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1 },
    { url: abs("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: abs("/programmes"), changeFrequency: "monthly", priority: 0.9 },
    ...programmes.map((p) => ({
      url: abs(`/programmes/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [img(p.image)],
    })),
    { url: abs("/gallery"), changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/news"), changeFrequency: "weekly", priority: 0.8 },
    ...articles.map((a) => ({
      url: abs(`/news/${a.slug}`),
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
      images: [img(a.image)],
    })),
    { url: abs("/volunteer"), changeFrequency: "monthly", priority: 0.8 },
    { url: abs("/donate"), changeFrequency: "monthly", priority: 0.9 },
    { url: abs("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: abs("/faq"), changeFrequency: "monthly", priority: 0.6 },
    { url: abs("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/cookies"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
