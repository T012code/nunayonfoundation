import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./thank-you.module.css";

// One thank-you page per form. Forms redirect here after a successful submission.
const PAGES = {
  newsletter: {
    title: "You're nearly on the list.",
    body: "We've sent a confirmation email. Click the link inside and the next story from the field will land in your inbox.",
    next: { href: "/news", label: "Read our latest stories" },
  },
  contact: {
    title: "Thank you. Your message is with us.",
    body: "Someone from the foundation will reply within two working days. If it's urgent, call or WhatsApp us.",
    next: { href: "/programmes", label: "See what we do" },
  },
  volunteer: {
    title: "Thank you for offering your time.",
    body: "We'll be in touch about the next outreach near you and how you'd like to help.",
    next: { href: "/gallery", label: "See past outreaches" },
  },
  partner: {
    title: "Thank you for reaching out to partner with us.",
    body: "Our team will review your details and contact you to talk about what we can do together.",
    next: { href: "/programmes", label: "Explore our programmes" },
  },
  donation: {
    title: "Thank you for your gift.",
    body: "We'll confirm when your transfer arrives and let you know where it goes. Your kindness keeps children in school and families on their feet.",
    next: { href: "/news", label: "See your support at work" },
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

  return (
    <section className={styles.section}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.sprout} aria-hidden="true">
          <Logo variant="mark" className={styles.mark} />
        </div>
        <h1 className={styles.title}>
          <Words text={page.title} />
        </h1>
        <p className={styles.body}>{page.body}</p>
        <div className={styles.actions}>
          <ButtonLink href={page.next.href} variant="primary">
            {page.next.label}
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" arrow={false}>
            Back to home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
