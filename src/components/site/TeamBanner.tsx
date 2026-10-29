import type { SiteMode } from "@/content/site-mode";
import styles from "./TeamBanner.module.css";

/**
 * Across the top of the site for signed-in team members while the site is in maintenance or
 * coming-soon mode: they see the real site, everyone else sees the status page.
 */
export function TeamBanner({ mode }: { mode: Exclude<SiteMode, "live"> }) {
  const label = mode === "maintenance" ? "Maintenance mode is on." : "Coming soon mode is on.";
  return (
    <div className={styles.banner} role="status">
      <p className={`wrap ${styles.inner}`}>
        <span className={styles.text}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" />
            <circle cx="8" cy="8" r="2" />
          </svg>
          <strong>{label}</strong> Visitors see the {mode === "maintenance" ? "maintenance" : "coming soon"} page. You can see the site because
          you&apos;re signed in to the admin.
        </span>
        <span className={styles.links}>
          <a href={`/site-preview?mode=${mode}`}>See what visitors see</a>
          <a href="/admin/site-status">Change site status</a>
        </span>
      </p>
    </div>
  );
}
