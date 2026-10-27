import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./admin.module.css";

/** Page heading with an optional back link, lead and actions. */
export function PageHead({
  title,
  lead,
  back,
  actions,
}: {
  title: string;
  lead?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className={styles.head}>
      <div>
        {back ? (
          <Link href={back.href} className={styles.crumb}>
            ← {back.label}
          </Link>
        ) : null}
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

export function Card({ title, lead, children }: { title?: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      {title ? <h2 className={styles.cardTitle}>{title}</h2> : null}
      {lead ? <p className={styles.cardLead}>{lead}</p> : null}
      {children}
    </section>
  );
}

export function Badge({ tone, children }: { tone?: "green" | "amber" | "red" | "teal"; children: ReactNode }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}

export function Notice({ tone, children }: { tone?: "error" | "green"; children: ReactNode }) {
  return (
    <div className={styles.notice} data-tone={tone} role={tone === "error" ? "alert" : undefined}>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export const formatDate = (iso?: string | null) => (iso ? dateFmt.format(new Date(iso)) : "");
export const formatTime = (iso?: string | null) => (iso ? timeFmt.format(new Date(iso)) : "");

export { styles as adminStyles };
