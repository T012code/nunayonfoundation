"use server";

import { ActionError, requireAction } from "@/lib/admin/access";
import { imageRefs, json, required, str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";
import { emailProblem } from "@/lib/validate";

type Social = { label: string; href: string };
type Account = { currency: string; bank: string; name: string; number: string };
type Stat = { value: number; suffix: string; label: string };

export async function saveSettings(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("settings");
    const email = required(fd, "email", "Public email", 200);
    const notify = str(fd, "notify_email", 200);
    for (const [label, v] of [["Public email", email], ["Alerts email", notify]] as const) {
      const problem = v ? emailProblem(v) : null;
      if (problem) throw new ActionError(`${label}: ${problem}`);
    }
    const socials = json<Social[]>(fd, "socials", []).filter((s) => s.label && s.href);
    for (const s of socials) {
      if (!/^https:\/\//.test(s.href)) throw new ActionError(`The ${s.label} link should start with https://`);
    }
    const accounts = json<Account[]>(fd, "bank_accounts", []).filter((a) => a.number);
    const impact = json<Stat[]>(fd, "impact", []).filter((s) => s.label).slice(0, 6);
    const slides = imageRefs(fd, "slides");
    if (!slides.length) throw new ActionError("The home page slideshow needs at least one photo.");

    check(
      await supabase
        .from("site_settings")
        .update({
          email,
          phone: str(fd, "phone", 40),
          whatsapp: str(fd, "whatsapp", 40),
          address: str(fd, "address", 300),
          notify_email: notify,
          socials,
          bank_accounts: accounts,
          impact,
          hero: { title: required(fd, "hero_title", "Home page headline", 140), lead: str(fd, "hero_lead", 400), slides },
        })
        .eq("id", true),
    );
    refreshSite();
    return { ok: true, message: "Saved. The site updates in a moment." };
  });
}
