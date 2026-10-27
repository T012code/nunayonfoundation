import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Words } from "@/components/motion/Words";
import styles from "@/app/(site)/thank-you/[form]/thank-you.module.css";

/** A short full-screen message with the growing sprout: thank-you, confirm and unsubscribe pages. */
export function Notice({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.sprout} aria-hidden="true">
          <Logo variant="mark" className={styles.mark} />
        </div>
        <h1 className={styles.title}>
          <Words text={title} />
        </h1>
        <p className={styles.body}>{body}</p>
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </section>
  );
}
