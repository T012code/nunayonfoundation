"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { nav } from "@/content/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader({
  open,
  onMenu,
  toggleRef,
}: {
  open: boolean;
  onMenu: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Nunayon Foundation, home">
          <Logo variant="stacked" className={styles.logo} aria-hidden="true" />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ButtonLink href="/donate" variant="cta" arrow={false} className={styles.donate}>
            Donate
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={onMenu}
          >
            <span>Menu</span>
            <span className={styles.burger} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
