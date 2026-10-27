"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { usePressStates } from "@/lib/usePressStates";
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
  me: { name: string; email: string; role: string };
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  usePressStates();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  // A name that's just the role (e.g. "Super admin") says nothing new; show the email instead.
  const display = me.name && me.name.toLowerCase() !== me.role.toLowerCase() ? me.name : me.email;

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
            <Link href="/admin/account" className={styles.meCard} aria-current={pathname === "/admin/account" ? "page" : undefined}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(display)}
              </span>
              <span className={styles.meText}>
                <span className={styles.meName}>{display}</span>
                <span className={styles.meRole}>{me.role}</span>
              </span>
              <Icon name="chevron" className={styles.meChevron} />
              <span className="visually-hidden">, your account</span>
            </Link>
            <div className={styles.meActions}>
              <Link href="/" target="_blank" className={styles.meAction}>
                <Icon name="external" /> View site
              </Link>
              <form action={signOut}>
                <button type="submit" className={styles.meAction}>
                  <Icon name="signout" /> Sign out
                </button>
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

/** Up to two initials from a name, or the first letter of an email. */
function initials(name: string) {
  const words = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase() || "?";
}
