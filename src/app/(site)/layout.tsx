import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteShell } from "@/components/site/SiteShell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell footer={<SiteFooter year={new Date().getUTCFullYear()} />}>{children}</SiteShell>;
}
