"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { jumpTo, lockScroll } from "@/lib/scroll";
import { nav } from "@/content/site";
import { SiteHeader } from "./SiteHeader";
import styles from "./SiteShell.module.css";
import { isCurrent } from "@/lib/nav";

/**
 * Page frame with the drawer menu used below desktop widths: the menu sits behind the page,
 * and opening it slides and shrinks the whole page to the left as one surface.
 */
type Contact = { email: string; phone: string; whatsapp: string };

export function SiteShell({ children, footer, contact: site }: { children: ReactNode; footer: ReactNode; contact: Contact }) {
  // `frozen` pins the page at its scroll position while it slides; `open` drives the slide.
  const [frozen, setFrozen] = useState<{ y: number; path: string } | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreY = useRef<number | null>(null);

  const openMenu = useCallback(() => {
    lockScroll(true);
    setFrozen({ y: window.scrollY, path: window.location.pathname });
    // Next frame, so the slide starts from the pinned page.
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Once the page has slid back, unpin it and restore the scroll position.
  useEffect(() => {
    if (open || frozen === null) return;
    const surface = surfaceRef.current;
    const done = () => {
      // A menu link that changed page lands at the top; otherwise return to where the reader was.
      restoreY.current = frozen.path === pathname ? frozen.y : 0;
      setFrozen(null);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !surface) return done();
    const timer = window.setTimeout(done, 700);
    const onEnd = (e: TransitionEvent) => {
      if (e.target === surface && e.propertyName === "transform") {
        window.clearTimeout(timer);
        done();
      }
    };
    surface.addEventListener("transitionend", onEnd);
    return () => {
      window.clearTimeout(timer);
      surface.removeEventListener("transitionend", onEnd);
    };
  }, [open, frozen, pathname]);

  // Restore the scroll position only once the page is back in normal flow (full height).
  useLayoutEffect(() => {
    if (frozen !== null || restoreY.current === null) return;
    jumpTo(restoreY.current);
    lockScroll(false);
    restoreY.current = null;
    toggleRef.current?.focus({ preventScroll: true });
  }, [frozen]);

  // Navigating closes the menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    // Leaving the drawer layout (rotating to landscape on a tablet) closes it.
    const mq = window.matchMedia("(min-width: 64rem)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open, close]);

  return (
    <div
      className={styles.shell}
      data-open={open || undefined}
      data-frozen={frozen !== null || undefined}
      style={frozen !== null ? ({ "--scroll-y": `${frozen.y}px` } as CSSProperties) : undefined}
    >
      <nav
        ref={drawerRef}
        id="site-menu"
        className={styles.drawer}
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
      >
        <button type="button" className={styles.close} onClick={close} aria-label="Close menu">
          <span className={styles.closeIcon} aria-hidden="true" />
        </button>
        <ul className={styles.drawerLinks}>
          <li>
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
              Home
            </Link>
          </li>
          {nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/donate" className={styles.drawerDonate}>
          Donate
        </Link>
        <div className={styles.drawerFoot}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}>WhatsApp us</a>
        </div>
        <Logo variant="mark" className={`${styles.drawerMark} logo-reversed`} aria-hidden="true" />
      </nav>

      <div ref={surfaceRef} className={styles.surface} inert={frozen !== null}>
        <SiteHeader open={open} onMenu={openMenu} toggleRef={toggleRef} />
        <div className={styles.page}>
          <main id="main" tabIndex={-1} className={styles.main}>
            {children}
          </main>
          {footer}
        </div>
      </div>
      {open ? <button type="button" className={styles.scrim} aria-label="Close menu" onClick={close} /> : null}
      <MotionRoot />
    </div>
  );
}
