"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
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
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Hides while reading down the page, returns on any scroll up; the bar shows progress.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) > 6) {
        const focusInside = headerRef.current?.contains(document.activeElement);
        setHidden(y > lastY && y > 320 && !focusInside);
        lastY = y;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={styles.header}
      data-scrolled={scrolled || undefined}
      data-hidden={(hidden && !open) || undefined}
      onFocus={() => setHidden(false)}
    >
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
