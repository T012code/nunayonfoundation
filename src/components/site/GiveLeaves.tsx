"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import styles from "./SiteFooter.module.css";

// Sprouts from the logo behind the footer's "someone like you" panel: one large, a few small.
const SPROUTS = [
  { right: "-2%", bottom: "-6%", size: "clamp(10rem, 16vw, 15rem)", angle: -8, o: 0.3 },
  { right: "38%", bottom: "6%", size: "clamp(2.5rem, 3.5vw, 3.5rem)", angle: 24, o: 0.32 },
  { right: "26%", bottom: "56%", size: "clamp(1.75rem, 2.5vw, 2.5rem)", angle: -34, o: 0.26 },
  { right: "8%", bottom: "72%", size: "clamp(2rem, 3vw, 3rem)", angle: 40, o: 0.24 },
];

/**
 * When the panel first comes into view the large sprout grows up from the corner, the small
 * ones float in and settle, and a soft light passes across once. Pointing at the panel makes the
 * leaves rustle. Nothing loops on its own. GSAP is loaded only when the panel is near, so the
 * rest of the page doesn't pay for it; with reduced motion the leaves simply sit in place.
 */
export function GiveLeaves() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const panel = el?.parentElement;
    if (!el || !panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.state = "still";
      return;
    }

    let cleanup = () => {};
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const { gsap } = await import("@/lib/gsap");
        if (cancelled) return;
        const [big, ...small] = el.querySelectorAll<HTMLElement>("[data-sprout]");
        const sheen = el.querySelector<HTMLElement>("[data-sheen]");
        el.dataset.state = "live";

        const ctx = gsap.context(() => {
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .from(big, { scale: 0, rotation: -28, transformOrigin: "50% 100%", duration: 1.6, ease: "back.out(1.7)" }, 0.1)
            .from(small, { autoAlpha: 0, y: 46, rotation: (i: number) => (i % 2 ? 60 : -60), duration: 1.4, stagger: 0.14 }, 0.35)
            .fromTo(sheen, { xPercent: -120, autoAlpha: 0 }, { xPercent: 120, autoAlpha: 1, duration: 2.2, ease: "power2.inOut" }, 0.2)
            .to(sheen, { autoAlpha: 0, duration: 0.6 }, 1.8);
        }, el);

        // A rustle when a pointer arrives: each leaf tips and springs back.
        const rustle = () => {
          gsap.to(el.querySelectorAll("[data-sprout] svg"), {
            keyframes: { rotation: [0, 9, -6, 3, 0] },
            transformOrigin: "50% 100%",
            duration: 1.1,
            ease: "sine.out",
            stagger: 0.06,
            overwrite: true,
          });
        };
        const fine = window.matchMedia("(hover: hover)").matches;
        if (fine) panel.addEventListener("pointerenter", rustle);
        cleanup = () => {
          ctx.revert();
          if (fine) panel.removeEventListener("pointerenter", rustle);
        };
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(panel);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div ref={root} className={styles.giveArt} aria-hidden="true">
      <span data-sheen="" className={styles.giveSheen} />
      {SPROUTS.map((s, i) => (
        <span
          key={i}
          data-sprout=""
          className={styles.giveSprout}
          style={{ right: s.right, bottom: s.bottom, width: s.size, "--angle": `${s.angle}deg`, "--o": s.o } as CSSProperties}
        >
          <Logo variant="mark" className="logo-reversed" />
        </span>
      ))}
    </div>
  );
}
