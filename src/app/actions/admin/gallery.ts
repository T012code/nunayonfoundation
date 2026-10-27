"use server";

import { redirect } from "next/navigation";
import type { ImageRef } from "@/content/images";
import { ActionError, requireAction } from "@/lib/admin/access";
import { bool, json, required, slugify, str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";

type PhotoIn = { id?: string; image: ImageRef; caption: string };

export async function saveAlbum(id: string | null, _: unknown, fd: FormData): Promise<ActionResult> {
  let created: string | null = null;
  const result = await run(async () => {
    const { supabase } = await requireAction("gallery");
    const title = required(fd, "title", "Album name", 120);
    const slug = slugify(str(fd, "slug", 80) || title);
    if (!slug) throw new ActionError("Add a short name using letters and numbers.");
    const photos = json<PhotoIn[]>(fd, "photos", []).filter((p) => p && p.image).slice(0, 500);
    const row = { title, slug, published: bool(fd, "published") };

    let albumId = id;
    if (albumId) {
      check(await supabase.from("albums").update(row).eq("id", albumId));
    } else {
      const { data: last } = await supabase.from("albums").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
      const { data } = check(await supabase.from("albums").insert({ ...row, sort: (last?.sort ?? 0) + 1 }).select("id").single());
      albumId = created = (data as { id: string }).id;
    }

    // Bring the album's photos in line with the list on screen: remove, update, add.
    const { data: existing } = await supabase.from("photos").select("id").eq("album_id", albumId);
    const keep = new Set(photos.map((p) => p.id).filter(Boolean));
    const gone = (existing ?? []).map((p) => p.id as string).filter((pid) => !keep.has(pid));
    if (gone.length) check(await supabase.from("photos").delete().in("id", gone), "remove photos");
    for (const [sort, p] of photos.entries()) {
      const fields = { image: p.image, caption: String(p.caption ?? "").trim().slice(0, 300), sort };
      if (p.id) check(await supabase.from("photos").update(fields).eq("id", p.id).eq("album_id", albumId), "save photos");
      else check(await supabase.from("photos").insert({ ...fields, album_id: albumId }), "add photos");
    }
    refreshSite();
    return { ok: true, message: `Saved · ${photos.length} photo${photos.length === 1 ? "" : "s"}` };
  });
  if (created) redirect(`/admin/gallery/${created}?saved=1`);
  return result;
}

export async function moveAlbum(id: string, direction: -1 | 1) {
  return run(async () => {
    const { supabase } = await requireAction("gallery");
    const { data } = await supabase.from("albums").select("id, sort").order("sort");
    const list = (data ?? []) as { id: string; sort: number }[];
    const i = list.findIndex((a) => a.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    for (const [k, a] of list.entries()) {
      if (a.sort !== k) check(await supabase.from("albums").update({ sort: k }).eq("id", a.id), "reorder");
    }
    refreshSite();
  });
}

export async function deleteAlbum(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("gallery");
    check(await supabase.from("albums").delete().eq("id", id), "delete the album");
    refreshSite();
  });
  if (result.ok) redirect("/admin/gallery");
  return result;
}
