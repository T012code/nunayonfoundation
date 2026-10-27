"use server";

import { ActionError, requireAction } from "@/lib/admin/access";
import { imageRefs, json, required, str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";
import { bankProblems, cleanAccount, type BankAccount } from "@/content/bank";
import { addressList } from "@/lib/mail";
import { emailProblem } from "@/lib/validate";

type Social = { label: string; href: string };
type Stat = { value: number; suffix: string; label: string };

export async function saveSettings(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("settings");
    const email = required(fd, "email", "Public email", 200);
    const emailIssue = emailProblem(email);
    if (emailIssue) throw new ActionError(`Public email: ${emailIssue}`);
    // Form alerts: ticked team members plus any other addresses.
    const other = str(fd, "notify_other", 2000);
    const typed = other.split(/[\s,;]+/).filter(Boolean);
    for (const a of typed) {
      const problem = emailProblem(a);
      if (problem) throw new ActionError(`Form alerts, "${a}": ${problem}`);
    }
    const notify = addressList([...fd.getAll("notify_members").map(String), ...typed].join(",")).join(", ");
    const socials = json<Social[]>(fd, "socials", []).filter((s) => s.label && s.href);
    for (const s of socials) {
      if (!/^https:\/\//.test(s.href)) throw new ActionError(`The ${s.label} link should start with https://`);
    }
    const accounts = json<Partial<BankAccount>[]>(fd, "bank_accounts", [])
      .map(cleanAccount)
      .filter((a) => a.number || a.iban);
    accounts.forEach((a, i) => {
      const problems = bankProblems(a);
      if (problems.length) throw new ActionError(`Bank account ${i + 1} (${a.currency}): ${problems.join(", ")}.`);
    });

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
        })
        .eq("id", true),
    );
    refreshSite();
    return { ok: true, message: "Saved. The site updates in a moment." };
  });
}

/** Content > Homepage: the hero (headline, intro, slideshow) and the impact figures. */
export async function saveHomepage(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("settings");
    const impact = json<Stat[]>(fd, "impact", []).filter((s) => s.label).slice(0, 6);
    const slides = imageRefs(fd, "slides");
    if (!slides.length) throw new ActionError("The home page slideshow needs at least one photo.");
    check(
      await supabase
        .from("site_settings")
        .update({
          impact,
          hero: { title: required(fd, "hero_title", "Home page headline", 140), lead: str(fd, "hero_lead", 400), slides },
        })
        .eq("id", true),
    );
    refreshSite();
    return { ok: true, message: "Saved. The home page updates in a moment." };
  });
}
