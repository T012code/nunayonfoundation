"use server";

import { MEDIA_BUCKET, mediaPath } from "@/content/images";
import { ActionError, can, requireAction } from "@/lib/admin/access";
import { mediaUsage, type MediaRow } from "@/lib/admin/media";
import { check, run } from "@/lib/admin/result";
import { serviceClient } from "@/lib/supabase/server";

const CONTENT = ["news", "gallery", "programmes", "people", "settings"] as const;

async function requireContent() {
  const ctx = await requireAction();
  if (!CONTENT.some((p) => can(ctx.access, p))) throw new ActionError("You don't have permission to manage photos.");
  return ctx;
}

export async function updateAlt(id: string, alt: string) {
  return run(async () => {
    const { supabase } = await requireContent();
    check(await supabase.from("media").update({ alt: alt.trim().slice(0, 300) }).eq("id", id), "save the description");
    return { ok: true, message: "Description saved" };
  });
}

/** Deletes a photo and all its sizes, unless it's still used somewhere on the site. */
export async function deleteMedia(id: string) {
  return run(async () => {
    const { supabase } = await requireContent();
    const usage = (await mediaUsage(serviceClient() ?? supabase)).get(id);
    if (usage?.length) {
      throw new ActionError(`This photo is still used in ${usage.map((u) => u.label).join(", ")}. Remove it there first.`);
    }
    const { data } = await supabase.from("media").select("sizes, format").eq("id", id).maybeSingle<Pick<MediaRow, "sizes" | "format">>();
    if (!data) throw new ActionError("That photo was already deleted.");
    const paths = data.sizes.map((w) => mediaPath(id, w, data.format));
    const removed = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
    if (removed.error) throw new ActionError(`Couldn't delete the files: ${removed.error.message}`);
    check(await supabase.from("media").delete().eq("id", id), "delete the photo");
    return { ok: true, message: "Photo deleted" };
  });
}
