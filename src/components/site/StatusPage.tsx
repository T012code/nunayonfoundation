import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { NewsletterForm } from "./NewsletterForm";
import { MODE_DEFAULTS, type SiteMode } from "@/content/site-mode";
import styles from "./StatusPage.module.css";

type Props = {
  mode: Exclude<SiteMode, "live">;
  title?: string;
  message?: string;
  until?: string;
  contact: { email: string; phone: string; whatsapp: string };
  socials: { label: string; href: string }[];
};

/**
 * What visitors see while the site is in maintenance or coming-soon mode: the logo, a short
 * message, when it'll be back, and ways to reach the foundation (plus newsletter sign-up
 * when it's a launch page).
 */
export function StatusPage({ mode, title, message, until, contact, socials }: Props) {
  const d = MODE_DEFAULTS[mode];
  const wa = contact.whatsapp.replace(/[^\d]/g, "");
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.leaves} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <Logo key={i} variant="mark" className={`${styles.leaf} logo-reversed`} style={{ "--i": i, "--size": `${1.5 + ((i * 7) % 4) * 0.6}rem` } as React.CSSProperties} title="" />
        ))}
      </div>

      <header className={styles.top}>
        <Logo variant="stacked" className={`${styles.logo} logo-reversed`} />
      </header>

      <section className={styles.center}>
        <p className={styles.eyebrow}>{d.eyebrow}</p>
        <h1 className={styles.title}>{title?.trim() || d.title}</h1>
        <p className={styles.message}>{message?.trim() || d.message}</p>
        {until?.trim() ? (
          <p className={styles.until}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.25" />
              <path d="M8 4.5V8l2.5 1.5" />
            </svg>
            {mode === "maintenance" ? "Back by" : "Opening"} {until.trim()}
          </p>
        ) : null}

        {mode === "coming_soon" ? (
          <div className={styles.signup}>
            <p className={styles.signupLabel}>Be the first to know</p>
            <NewsletterForm />
          </div>
        ) : null}

        <div className={styles.actions}>
          {contact.email ? (
            <ButtonLink href={`mailto:${contact.email}`} variant={mode === "maintenance" ? "cta" : "inverse"} arrow={false}>
              Email us
            </ButtonLink>
          ) : null}
          {wa ? (
            <ButtonLink href={`https://wa.me/${wa}`} variant="inverse" arrow={false}>
              WhatsApp
            </ButtonLink>
          ) : null}
          {contact.phone ? (
            <ButtonLink href={`tel:${contact.phone.replace(/\s/g, "")}`} variant="inverse" arrow={false}>
              Call {contact.phone}
            </ButtonLink>
          ) : null}
        </div>
      </section>

      <footer className={styles.foot}>
        {socials.length ? (
          <ul className={styles.socials}>
            {socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p>© {new Date().getUTCFullYear()} Nunayon Foundation</p>
      </footer>
    </main>
  );
}
