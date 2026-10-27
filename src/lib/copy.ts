import "server-only";
import { cache } from "react";
import { COPY, type Copy, type CopyKey } from "@/content/copy";
import { fitCopy } from "@/lib/copy-merge";
import { publicClient } from "@/lib/supabase/server";

/** Every page's saved text, read once per request. */
const savedCopy = cache(async () => {
  try {
    const { data, error } = await publicClient().from("page_content").select("slug, content");
    if (error) throw error;
    return new Map((data ?? []).map((r) => [r.slug as string, r.content as unknown]));
  } catch (error) {
    console.error("[copy] using default page text", error);
    return new Map<string, unknown>();
  }
});

/** A page's words: what's been saved in the admin, over the defaults. */
export async function getCopy<K extends CopyKey>(key: K): Promise<Copy<K>> {
  const saved = await savedCopy();
  return fitCopy(COPY[key], saved.get(key));
}

/** Fills {phone}-style placeholders in a line of text. */
export const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k) => values[k] ?? m);
