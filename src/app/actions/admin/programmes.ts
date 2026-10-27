"use server";

import { redirect } from "next/navigation";
import { ActionError, requireAction } from "@/lib/admin/access";
import { bool, imageRef, imageRefs, json, required, slugify, str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";

type Step = { title: string; body: string };

export async function saveProgramme(id: string | null, _: unknown, fd: FormData): Promise<ActionResult> {
  let created: string | null = null;
  const result = await run(async () => {
    const { supabase } = await requireAction("programmes");
    const title = required(fd, "title", "Name", 120);
    const slug = slugify(str(fd, "slug", 80) || title);
    if (!slug) throw new ActionError("Add a web address (slug) using letters and numbers.");
    const image = imageRef(fd, "image");
    if (!image) throw new ActionError("Add a main photo.");
    const steps = json<Step[]>(fd, "steps", []).filter((s) => s.title || s.body).slice(0, 8);
    const row = {
      title,
      slug,
      summary: required(fd, "summary", "Summary", 300),
      intro: required(fd, "intro", "Introduction", 2000),
      image,
      covers: json<string[]>(fd, "covers", []).filter(Boolean).slice(0, 12),
      steps,
      stat: { value: str(fd, "stat_value", 20), label: str(fd, "stat_label", 80) },
      photos: imageRefs(fd, "photos"),
      published: bool(fd, "published"),
    };
    if (id) {
      check(await supabase.from("programmes").update(row).eq("id", id));
    } else {
      const { data: last } = await supabase.from("programmes").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
      const { data } = check(await supabase.from("programmes").insert({ ...row, sort: (last?.sort ?? 0) + 1 }).select("id").single());
      created = (data as { id: string }).id;
    }
    refreshSite();
    return { ok: true, message: "Saved" };
  });
  if (created) redirect(`/admin/programmes/${created}?saved=1`);
  return result;
}

export async function moveProgramme(id: string, direction: -1 | 1) {
  return run(async () => {
    const { supabase } = await requireAction("programmes");
    const { data } = await supabase.from("programmes").select("id, sort").order("sort").order("title");
    const list = (data ?? []) as { id: string; sort: number }[];
    const i = list.findIndex((p) => p.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    for (const [k, p] of list.entries()) {
      if (p.sort !== k) check(await supabase.from("programmes").update({ sort: k }).eq("id", p.id), "reorder");
    }
    refreshSite();
  });
}

export async function deleteProgramme(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("programmes");
    check(await supabase.from("programmes").delete().eq("id", id), "delete the programme");
    refreshSite();
  });
  if (result.ok) redirect("/admin/programmes");
  return result;
}
