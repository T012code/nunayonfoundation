import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { SettingsForm, type SettingsValues } from "./SettingsForm";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsAdmin() {
  const { supabase } = await requirePage("settings");
  // Team members to pick from for form alerts (only visible to the super admin and admins).
  const [{ data }, { data: team }] = await Promise.all([
    supabase.from("site_settings").select("*").maybeSingle(),
    supabase.from("admins").select("name, email").eq("active", true).order("name"),
  ]);
  return (
    <div className={s.page}>
      <PageHead title="Site settings" lead="Details shown across the site: contact information, social links and bank accounts. The home page headline, slideshow and impact figures are under Content › Homepage." />
      <SettingsForm values={data as SettingsValues} team={(team ?? []) as { name: string; email: string }[]} />
    </div>
  );
}
