import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { SiteStatusForm, type SiteStatusValues } from "./SiteStatusForm";

export const metadata: Metadata = { title: "Site status" };

export default async function SiteStatus() {
  const { supabase } = await requirePage("manage");
  const { data } = await supabase.from("site_settings").select("site_mode, mode_title, mode_message, mode_until").maybeSingle<SiteStatusValues>();
  return (
    <div className={s.page}>
      <PageHead
        title="Site status"
        lead="Take the public site offline for maintenance, or show a coming soon page before launch. Anyone signed in to the admin still sees the real site, with a banner on top. Newsletter confirm and unsubscribe links keep working."
      />
      <SiteStatusForm values={data ?? { site_mode: "live", mode_title: "", mode_message: "", mode_until: "" }} />
    </div>
  );
}
