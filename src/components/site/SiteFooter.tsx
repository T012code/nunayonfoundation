import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LeafField, type Leaf } from "@/components/motion/LeafField";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { site } from "@/content/site";
import { BackToTop } from "./BackToTop";
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

const LEAVES: Leaf[] = [
  { top: "4%", left: "70%", size: "clamp(10rem, 20vw, 18rem)", speed: 0.22, rotate: -24, angle: 18, opacity: 0.12 },
  { top: "36%", left: "-4%", size: "clamp(8rem, 14vw, 12rem)", speed: 0.4, rotate: 36, angle: -20, opacity: 0.13, sway: 13 },
  { top: "48%", left: "52%", size: "clamp(4rem, 6vw, 5.5rem)", speed: 0.65, rotate: -70, angle: 30, opacity: 0.16, sway: 9 },
  { top: "12%", left: "34%", size: "clamp(3rem, 4vw, 4rem)", speed: 0.8, rotate: 90, angle: -45, opacity: 0.14, sway: 11 },
];

export function SiteFooter({ year }: { year: number }) {
  return (
    <footer className={styles.footer}>
      <LeafField leaves={LEAVES} />

      <div className={`wrap ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.news}>
            <Reveal as="p" className={styles.kicker}>
              Newsletter
            </Reveal>
            <h2 className={styles.newsTitle} data-reveal="words">
              <Words text="Stories from the field, in your inbox." />
            </h2>
            <Reveal as="p" delay={0.3} className={styles.newsText}>
              One email a month about the families we meet and what your support did. No spam, and you can leave any
              time.
            </Reveal>
            <Reveal delay={0.4}>
              <NewsletterForm />
            </Reveal>
          </div>

          <Reveal delay={0.2} className={styles.give}>
            <p className={styles.giveTitle}>Every outreach starts with someone like you.</p>
            <div className={styles.giveLinks}>
              <Link href="/donate" className={styles.pill}>
                Donate
              </Link>
              <Link href="/get-involved#volunteer" className={`${styles.pill} ${styles.pillGhost}`}>
                Volunteer
              </Link>
            </div>
          </Reveal>
        </div>

        <div className={styles.links}>
          <Reveal as="span" variant="draw" className={styles.rule} />
          <Reveal as="div" delay={0.05}>
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
          </Reveal>
          <Reveal as="div" delay={0.15}>
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
          </Reveal>
          <Reveal as="div" delay={0.25}>
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
        </div>

        <div className={styles.bottom}>
          <Reveal as="span" variant="draw" className={styles.rule} />
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
          <BackToTop />
        </div>
      </div>

      {/* Large logo along the bottom edge; rises into place as the page ends. */}
      <div className={styles.signature} aria-hidden="true">
        <div className={styles.signatureInner} data-drift="" data-speed="0.16" data-rotate="0">
          <Logo variant="stacked" className={`${styles.signatureLogo} logo-reversed`} />
        </div>
      </div>
    </footer>
  );
}
