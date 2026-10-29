import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteGate } from "@/components/site/SiteGate";
import { SiteShell } from "@/components/site/SiteShell";
import { StatusPage } from "@/components/site/StatusPage";
import { TeamBanner } from "@/components/site/TeamBanner";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { email, phone, whatsapp, socials, status } = await getSettings();
  const site = (
    <SiteShell contact={{ email, phone, whatsapp }} footer={<SiteFooter year={new Date().getUTCFullYear()} />}>
      {children}
    </SiteShell>
  );
  // Admin → Site status. Saving it refreshes every page, so the switch takes effect at once.
  if (status.mode === "live") return site;
  return (
    <SiteGate
      banner={<TeamBanner mode={status.mode} />}
      status={<StatusPage mode={status.mode} title={status.title} message={status.message} until={status.until} contact={{ email, phone, whatsapp }} socials={socials} />}
    >
      {site}
    </SiteGate>
  );
}
