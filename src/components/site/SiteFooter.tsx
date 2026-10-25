import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { site } from "@/content/site";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

const explore = [
  { href: "/about", label: "About us" },
  { href: "/programmes", label: "Programmes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News & stories" },
  { href: "/faq", label: "FAQ" },
];

const involved = [
  { href: "/donate", label: "Donate" },
  { href: "/get-involved#volunteer", label: "Volunteer" },
  { href: "/get-involved#partner", label: "Partner with us" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms & conditions" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter({ year }: { year: number }) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.news}>
            <h2 className={styles.newsTitle} data-reveal="words">
              <Words text="Stories from the field, in your inbox." />
            </h2>
            <Reveal as="p" delay={0.3} className={styles.newsText}>
              One email a month about the families we meet and what your support did.
            </Reveal>
            <Reveal delay={0.4}>
              <NewsletterForm />
            </Reveal>
          </div>
          <Reveal delay={0.2} className={styles.logoWrap}>
            <Logo variant="full" className={`${styles.logo} logo-reversed`} />
          </Reveal>
        </div>

        <Reveal className={styles.links}>
          <nav aria-label="Explore">
            <h3 className={styles.heading}>Explore</h3>
            <ul>
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Get involved">
            <h3 className={styles.heading}>Get involved</h3>
            <ul>
              {involved.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className={styles.contact}>
            <h3 className={styles.heading}>Visit or write</h3>
            <p>{site.address}</p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
              <br />
              <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}>WhatsApp us</a>
            </p>
            <p className={styles.socials}>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} rel="noopener noreferrer" target="_blank">
                  {s.label}
                </a>
              ))}
            </p>
          </address>
        </Reveal>

        <div className={styles.bottom}>
          <p>
            © {year} {site.name}
          </p>
          <ul>
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
