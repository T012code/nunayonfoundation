"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "./Icon";
import styles from "./admin.module.css";

export type NavItem = { href: string; label: string; icon: IconName; count?: number };
export type NavGroup = { label?: string; items: NavItem[] };

/** Sidebar (a drop-down menu on small screens) and the page area. */
export function AdminShell({
  groups,
  me,
  signOut,
  children,
}: {
  groups: NavGroup[];
  me: { name: string; role: string };
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  const isCurrent = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className={styles.shell}>
      <header className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <Logo variant="mark" className="logo-reversed" aria-hidden="true" />
          <span>Nunayon</span>
          <span className={styles.brandTag}>Admin</span>
        </Link>
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
        <div id="admin-nav" className={styles.navWrap} data-open={open || undefined}>
          <nav aria-label="Admin">
            {groups.map((g, i) => (
              <div key={i}>
                {g.label ? <p className={styles.navGroup}>{g.label}</p> : null}
                <ul className={styles.nav}>
                  {g.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.navLink} aria-current={isCurrent(item.href) ? "page" : undefined}>
                        <Icon name={item.icon} />
                        {item.label}
                        {item.count ? (
                          <span className={styles.navCount}>
                            {item.count}
                            <span className="visually-hidden"> new</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className={styles.me}>
            <span className={styles.meName}>{me.name}</span>
            <span className={styles.meRole}>{me.role}</span>
            <div className={styles.meLinks}>
              <Link href="/admin/account">Your account</Link>
              <Link href="/" target="_blank">
                View site
              </Link>
              <form action={signOut}>
                <button type="submit">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.main} id="main">
        {children}
      </main>
    </div>
  );
}
