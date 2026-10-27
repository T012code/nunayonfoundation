import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { ThanksGate } from "./ThanksGate";
import styles from "./thank-you.module.css";
import { getCopy } from "@/lib/copy";

// One thank-you page per form. Forms redirect here after a successful submission. The words
// are edited in the admin (Pages › Site-wide text); the links stay here.
const PAGES = {
  newsletter: {
    next: "/news",
    form: "/news",
  },
  contact: {
    next: "/programmes",
    form: "/contact",
  },
  volunteer: {
    next: "/gallery",
    form: "/volunteer",
  },
  partner: {
    next: "/programmes",
    form: "/contact?topic=partnership",
  },
  donation: {
    next: "/news",
    form: "/donate",
  },
} as const;

type Form = keyof typeof PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((form) => ({ form }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({ params }: { params: Promise<{ form: string }> }) {
  const { form } = await params;
  if (!(form in PAGES)) notFound();
  const page = PAGES[form as Form];
  const words = (await getCopy("site")).thanks[form as Form];

  return (
    <ThanksGate form={form} fallback={page.form}>
      <section className={styles.section}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={`wrap ${styles.inner}`}>
          <div className={styles.sprout} aria-hidden="true">
            <Logo variant="mark" className={styles.mark} />
          </div>
          <h1 className={styles.title}>
            <Words text={words.title} />
          </h1>
          <p className={styles.body}>{words.body}</p>
          <div className={styles.actions}>
            <ButtonLink href={page.next} variant="primary">
              {words.button}
            </ButtonLink>
            <ButtonLink href="/" variant="ghost" arrow={false}>
              Back to home
            </ButtonLink>
          </div>
        </div>
      </section>
    </ThanksGate>
  );
}
