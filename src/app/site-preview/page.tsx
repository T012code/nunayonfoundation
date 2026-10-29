import type { Metadata } from "next";
import { StatusPage } from "@/components/site/StatusPage";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Site status preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Params = { mode?: string; title?: string; message?: string; until?: string };

/** Admin → Site status → Preview: the maintenance or coming-soon page with the wording typed in. */
export default async function SitePreview({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const { email, phone, whatsapp, socials, status } = await getSettings();
  const mode = p.mode === "coming_soon" || p.mode === "maintenance" ? p.mode : status.mode === "live" ? "maintenance" : status.mode;
  const pick = (v: string | undefined, saved: string, max: number) => (v ?? saved).slice(0, max);
  return (
    <StatusPage
      mode={mode}
      title={pick(p.title, status.title, 140)}
      message={pick(p.message, status.message, 600)}
      until={pick(p.until, status.until, 80)}
      contact={{ email, phone, whatsapp }}
      socials={socials}
    />
  );
}
