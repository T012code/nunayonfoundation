import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

// Grows with each page as it is built; content pages will be listed from the database.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 }];
}
