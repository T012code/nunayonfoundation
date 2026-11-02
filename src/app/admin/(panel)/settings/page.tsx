import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { SettingsForm, type SettingsValues } from "./SettingsForm";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsAdmin() {
  const { supabase } = await requirePage("settings");
  // Team members to pick from for form alerts (only visible to the super admin and admins).
  // The super admin isn't listed; if they get alerts, they keep getting them (see `hidden`).
  const [{ data }, { data: people }] = await Promise.all([
    supabase.from("site_settings").select("*").maybeSingle(),
    supabase.from("admins").select("name, email, role").eq("active", true).order("name"),
  ]);
  const all = (people ?? []) as { name: string; email: string; role: string }[];
  const team = all.filter((m) => m.role !== "super_admin");
  const hidden = all.filter((m) => m.role === "super_admin").map((m) => m.email.toLowerCase());
  return (
    <div className={s.page}>
      <PageHead title="Site settings" lead="Details shown across the site: contact information, social links and bank accounts. The home page headline, slideshow and impact figures are under Content › Homepage." />
      <SettingsForm values={data as SettingsValues} team={team} hidden={hidden} />
    </div>
  );
}
