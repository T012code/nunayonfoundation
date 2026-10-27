import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { HomepageForm, type HomepageValues } from "./HomepageForm";

export const metadata: Metadata = { title: "Homepage" };

export default async function HomepageAdmin() {
  const { supabase } = await requirePage("settings");
  const { data } = await supabase.from("site_settings").select("impact, hero").maybeSingle();
  return (
    <div className={s.page}>
      <PageHead
        title="Homepage"
        lead={
          <>
            The headline, slideshow and impact figures at the top of the home page. The stories further down are picked in{" "}
            <Link href="/admin/news" className={s.textLink}>
              News
            </Link>
            .
          </>
        }
        actions={
          <Link href="/" className={s.secondaryButton} target="_blank">
            View home page
          </Link>
        }
      />
      <HomepageForm values={(data ?? { impact: [], hero: {} }) as HomepageValues} />
    </div>
  );
}
