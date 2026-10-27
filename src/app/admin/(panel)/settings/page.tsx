import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { SettingsForm, type SettingsValues } from "./SettingsForm";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsAdmin() {
  const { supabase } = await requirePage("settings");
  const { data } = await supabase.from("site_settings").select("*").maybeSingle();
  return (
    <div className={s.page}>
      <PageHead title="Site settings" lead="Details shown across the site: contact information, bank accounts, impact figures and the home page." />
      <SettingsForm values={data as SettingsValues} />
    </div>
  );
}
