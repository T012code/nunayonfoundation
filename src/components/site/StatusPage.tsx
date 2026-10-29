import { Logo } from "@/components/brand/Logo";
import { MODE_DEFAULTS, type SiteMode } from "@/content/site-mode";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./StatusPage.module.css";

type Props = {
  mode: Exclude<SiteMode, "live">;
  title?: string;
  message?: string;
  until?: string;
  contact: { email: string };
};

/**
 * What visitors see while the site is in maintenance or coming-soon mode: the logo, a short
 * message, when it'll be back, and one way to reach the foundation (plus newsletter sign-up
 * on the launch page). Deliberately quiet.
 */
export function StatusPage({ mode, title, message, until, contact }: Props) {
  const d = MODE_DEFAULTS[mode];
  return (
    <main className={styles.page}>
      <Logo variant="stacked" className={`${styles.logo} logo-reversed`} />
      <h1 className={styles.title}>{title?.trim() || d.title}</h1>
      <p className={styles.message}>
        {message?.trim() || d.message}
        {until?.trim() ? ` ${mode === "maintenance" ? "Back by" : "Opening"} ${until.trim()}.` : ""}
      </p>
      {mode === "coming_soon" ? (
        <div className={styles.signup}>
          <NewsletterForm />
        </div>
      ) : null}
      {contact.email ? (
        <a className={styles.contact} href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
      ) : null}
    </main>
  );
}
