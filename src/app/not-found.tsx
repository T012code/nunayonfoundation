import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Words } from "@/components/motion/Words";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteShell } from "@/components/site/SiteShell";
import { ButtonLink } from "@/components/ui/Button";
import { getSettings } from "@/lib/content";
import styles from "./(site)/thank-you/[form]/thank-you.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Missing pages get the full site around them (header, menu, footer) and a few ways on.
export default async function NotFound() {
  const { email, phone, whatsapp } = await getSettings();
  return (
    <SiteShell contact={{ email, phone, whatsapp }} footer={<SiteFooter year={new Date().getUTCFullYear()} />}>
      <section className={styles.section}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={`wrap ${styles.inner}`}>
          <div className={styles.sprout} aria-hidden="true">
            <Logo variant="mark" className={styles.mark} />
          </div>
          <h1 className={styles.title}>
            <Words text="We couldn't find that page." />
          </h1>
          <p className={styles.body}>
            The link may be old, or the page may have moved. Try one of these, or{" "}
            <Link href="/contact">tell us what you were looking for</Link>.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/" variant="primary">
              Back to home
            </ButtonLink>
            <ButtonLink href="/news" variant="ghost" arrow={false}>
              Latest news
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
