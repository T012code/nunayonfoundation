"use server";

import type { ImageRef } from "@/content/images";
import { requireAction } from "@/lib/admin/access";
import { json } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";

type PersonIn = { id?: string; name: string; role: string; bio: string; image: ImageRef | null; published: boolean };

/** Saves the whole list of people at once, in the order shown. */
export async function savePeople(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("people");
    const people = json<PersonIn[]>(fd, "people", [])
      .map((p) => ({ ...p, name: String(p.name ?? "").trim().slice(0, 120), role: String(p.role ?? "").trim().slice(0, 120), bio: String(p.bio ?? "").trim().slice(0, 1500) }))
      .filter((p) => p.name);
    const { data: existing } = await supabase.from("people").select("id");
    const keep = new Set(people.map((p) => p.id).filter(Boolean));
    const gone = (existing ?? []).map((p) => p.id as string).filter((id) => !keep.has(id));
    if (gone.length) check(await supabase.from("people").delete().in("id", gone), "remove people");
    for (const [sort, p] of people.entries()) {
      const fields = { name: p.name, role: p.role, bio: p.bio, image: p.image, published: p.published !== false, sort };
      if (p.id) check(await supabase.from("people").update(fields).eq("id", p.id));
      else check(await supabase.from("people").insert(fields));
    }
    refreshSite();
    return { ok: true, message: "Saved" };
  });
}
