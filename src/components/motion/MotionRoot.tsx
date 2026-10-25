"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { startSmoothScroll, stopSmoothScroll } from "@/lib/scroll";

/**
 * Runs the site's scroll motion from one place:
 * - smooth scrolling on desktop pointers,
 * - [data-reveal] elements animate in (CSS) the first time they enter the viewport,
 * - [data-parallax] elements drift against the scroll while on screen.
 * Sections only add data attributes; no per-component scripts.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    startSmoothScroll();
    return () => stopSmoothScroll();
  }, []);

  // Reveals: mark each element once it is a little way into the viewport.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-inview])");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => (el.dataset.inview = ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.inview = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Parallax: only elements on screen are updated, once per frame.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target as HTMLElement);
        else visible.delete(e.target as HTMLElement);
      }
      schedule();
    });
    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => io.observe(el));

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of visible) {
        const speed = Number(el.dataset.parallax) || 0.08;
        const r = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
        // -1 when the element's centre is at the bottom of the screen, +1 at the top.
        const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        el.style.transform = `translate3d(0, ${(t * speed * r.height).toFixed(1)}px, 0)`;
      }
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return null;
}
