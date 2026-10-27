"use server";

import { COPY, type CopyKey } from "@/content/copy";
import { ActionError, requireAction } from "@/lib/admin/access";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";
import { fitCopy } from "@/lib/copy-merge";

const known = (key: string): key is CopyKey => key in COPY;

/** Saves a page's words; anything not in the page's shape is dropped. */
export async function savePage(key: string, _: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("pages");
    if (!known(key)) throw new ActionError("That page doesn't exist.");
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(fd.get("content") ?? "{}"));
    } catch {
      throw new ActionError("Couldn't read the form. Reload the page and try again.");
    }
    const content = fitCopy(COPY[key], parsed);
    check(await supabase.from("page_content").upsert({ slug: key, content }, { onConflict: "slug" }), "save the page");
    refreshSite();
    return { ok: true, message: "Saved. The page updates in a moment." };
  });
}

/** Back to the original words for a page. */
export async function resetPage(key: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("pages");
    if (!known(key)) throw new ActionError("That page doesn't exist.");
    check(await supabase.from("page_content").delete().eq("slug", key), "reset the page");
    refreshSite();
    return { ok: true, message: "Back to the original text." };
  });
}
