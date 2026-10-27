import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { Words } from "@/components/motion/Words";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteShell } from "@/components/site/SiteShell";
import { ButtonLink } from "@/components/ui/Button";
import { getSettings } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import styles from "./(site)/thank-you/[form]/thank-you.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Missing pages get the full site around them (header, menu, footer) and a few ways on.
export default async function NotFound() {
  const [{ email, phone, whatsapp }, copy] = await Promise.all([getSettings(), getCopy("site")]);
  return (
    <SiteShell contact={{ email, phone, whatsapp }} footer={<SiteFooter year={new Date().getUTCFullYear()} />}>
      <section className={styles.section}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={`wrap ${styles.inner}`}>
          <div className={styles.sprout} aria-hidden="true">
            <Logo variant="mark" className={styles.mark} />
          </div>
          <h1 className={styles.title}>
            <Words text={copy.notFound.title} />
          </h1>
          <p className={styles.body}>{copy.notFound.body}</p>
          <div className={styles.actions}>
            <ButtonLink href="/" variant="primary">
              Back to home
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" arrow={false}>
              Contact us
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
