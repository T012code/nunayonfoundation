import Link from "next/link";
import styles from "@/components/admin/admin.module.css";

const TABS = [
  { href: "/admin/email", label: "Set-up" },
  { href: "/admin/email/templates", label: "Templates" },
  { href: "/admin/email/log", label: "Sent emails" },
] as const;

/** The three parts of Admin → Email. */
export function EmailTabs({ current }: { current: (typeof TABS)[number]["href"] }) {
  return (
    <nav className={styles.tabs} aria-label="Email">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={styles.tab} aria-current={t.href === current ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
