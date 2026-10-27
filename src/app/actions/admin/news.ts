"use server";

import { redirect } from "next/navigation";
import { requireAction } from "@/lib/admin/access";
import { bool, imageRef, imageRefs, required, slugify, str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";
import { ActionError } from "@/lib/admin/access";
import { HOME_STORIES } from "@/lib/home";

export async function saveArticle(id: string | null, _: unknown, fd: FormData): Promise<ActionResult> {
  let created: string | null = null;
  const result = await run(async () => {
    const { supabase } = await requireAction("news");
    const title = required(fd, "title", "Title", 200);
    const slug = slugify(str(fd, "slug", 80) || title);
    if (!slug) throw new ActionError("Add a web address (slug) using letters and numbers.");
    const image = imageRef(fd, "image");
    if (!image) throw new ActionError("Add a cover photo.");
    const published = bool(fd, "published");
    const date = str(fd, "published_at", 30);
    const row = {
      title,
      slug,
      excerpt: required(fd, "excerpt", "Summary", 400),
      body: required(fd, "body", "Story", 20000),
      image,
      photos: imageRefs(fd, "photos"),
      programme: str(fd, "programme", 80) || null,
      published,
      published_at: date ? new Date(date).toISOString() : published ? new Date().toISOString() : null,
    };
    if (id) {
      check(await supabase.from("articles").update(row).eq("id", id));
    } else {
      const { data } = check(await supabase.from("articles").insert(row).select("id").single());
      created = (data as { id: string }).id;
    }
    refreshSite();
    return { ok: true, message: published ? "Saved and live on the site" : "Saved as a draft" };
  });
  if (created) redirect(`/admin/news/${created}?saved=1`);
  return result;
}

export async function deleteArticle(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("news");
    check(await supabase.from("articles").delete().eq("id", id), "delete the story");
    refreshSite();
  });
  if (result.ok) redirect("/admin/news");
  return result;
}

/** Picks a story for the home page from the list (up to five), or takes it off. */
export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("news");
    if (featured) {
      const { count } = await supabase.from("articles").select("id", { count: "exact", head: true }).eq("featured", true).neq("id", id);
      if ((count ?? 0) >= HOME_STORIES) {
        throw new ActionError(`The home page already has ${HOME_STORIES} stories. Take one off first.`);
      }
    }
    check(await supabase.from("articles").update({ featured }).eq("id", id), "update the story");
    refreshSite();
    return { ok: true, message: featured ? "Now on the home page" : "Taken off the home page" };
  });
}

/** Deletes a story straight from the list. */
export async function deleteArticleInList(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("news");
    check(await supabase.from("articles").delete().eq("id", id), "delete the story");
    refreshSite();
    return { ok: true, message: "Story deleted" };
  });
}
