import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteShell } from "@/components/site/SiteShell";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { email, phone, whatsapp } = await getSettings();
  return (
    <SiteShell contact={{ email, phone, whatsapp }} footer={<SiteFooter year={new Date().getUTCFullYear()} />}>
      {children}
    </SiteShell>
  );
}
