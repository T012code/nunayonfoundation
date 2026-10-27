import { Logo } from "@/components/brand/Logo";
import styles from "./auth.module.css";

/** Shown in the card for a moment after signing in, while the dashboard loads. */
export function Welcome({ title = "Welcome back" }: { title?: string }) {
  return (
    <div className={styles.welcome} role="status">
      <div className={styles.welcomeMark} aria-hidden="true">
        <Logo variant="mark" />
      </div>
      <p className={styles.welcomeTitle}>{title}</p>
      <div className={styles.welcomeBar} aria-hidden="true">
        <span />
      </div>
      <span className="visually-hidden">Opening the dashboard</span>
    </div>
  );
}
