"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { nav } from "@/content/site";
import { onLayout, onScroll } from "@/lib/scroll";
import styles from "./SiteHeader.module.css";
import { isCurrent } from "@/lib/nav";

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
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Hides while reading down the page, returns on any scroll up; the bar shows progress.
  // Written straight to the DOM on the shared scroll loop, so scrolling never re-renders React.
  useEffect(() => {
    const header = headerRef.current;
    const bar = barRef.current;
    if (!header || !bar) return;
    let max = 1;
    let lastY = window.scrollY;
    const offLayout = onLayout(() => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    });
    const offScroll = onScroll((y) => {
      header.toggleAttribute("data-scrolled", y > 8);
      if (Math.abs(y - lastY) > 6) {
        const focusInside = header.contains(document.activeElement);
        header.toggleAttribute("data-hidden", y > lastY && y > 320 && !focusInside);
        lastY = y;
      }
      bar.style.transform = `scaleX(${Math.min(1, y / max).toFixed(4)})`;
    });
    return () => {
      offLayout();
      offScroll();
    };
  }, []);

  useEffect(() => {
    if (open) headerRef.current?.removeAttribute("data-hidden");
  }, [open]);

  return (
    <header ref={headerRef} className={styles.header} onFocus={() => headerRef.current?.removeAttribute("data-hidden")}>
      {/* Inside the header landmark, so every part of the page belongs to one. */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <span ref={barRef} className={styles.progress} aria-hidden="true" />
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
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
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
            aria-label="Open menu"
            onClick={onMenu}
          >
            <span className={styles.burger} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
