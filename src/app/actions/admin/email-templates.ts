"use server";

import { revalidatePath } from "next/cache";
import { ActionError, requireAction } from "@/lib/admin/access";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { EMAILS, FIELD_KEYS, isTemplateKey } from "@/lib/email-templates";

const LIMITS = { subject: 200, preheader: 200, heading: 200, body: 6000, button: 60, note: 600 } as const;

/** Saves one email's wording. Fields left the same as the built-in text are stored empty. */
export async function saveTemplate(key: string, _: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    if (!isTemplateKey(key)) throw new ActionError("Unknown email.");
    const def = EMAILS[key];
    const row: Record<string, string | boolean> = { key };
    for (const f of FIELD_KEYS) {
      const v = String(fd.get(f) ?? "").replace(/\r\n/g, "\n").trim();
      if (v.length > LIMITS[f]) throw new ActionError(`The ${f} is too long (at most ${LIMITS[f]} characters).`);
      row[f] = v === def.defaults[f] ? "" : v;
    }
    if (!row.subject && !def.defaults.subject) throw new ActionError("Add a subject.");
    row.enabled = "optional" in def ? fd.get("enabled") === "on" : true;
    check(await supabase.from("email_templates").upsert(row), "save");
    revalidatePath("/admin/email/templates");
    return { ok: true, message: "Saved. The next email uses this wording." };
  });
}

/** Back to the built-in wording. */
export async function resetTemplate(key: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    if (!isTemplateKey(key)) throw new ActionError("Unknown email.");
    check(await supabase.from("email_templates").delete().eq("key", key), "reset");
    revalidatePath("/admin/email/templates");
    return { ok: true, message: "Back to the original wording." };
  });
}
