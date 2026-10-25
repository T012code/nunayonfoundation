"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { onLayout, onScroll, startSmoothScroll, stopSmoothScroll } from "@/lib/scroll";
import "lenis/dist/lenis.css";

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

  // Parallax: positions are measured on layout changes only; each frame is plain arithmetic.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
    if (!els.length) return;
    let items: { el: HTMLElement; top: number; height: number; speed: number }[] = [];
    let vh = window.innerHeight;

    const measure = () => {
      vh = window.innerHeight;
      const y = window.scrollY;
      items = els.map((el) => {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        return { el, top: box.top + y, height: box.height, speed: Number(el.dataset.parallax) || 0.08 };
      });
    };

    const update = (y: number) => {
      for (const it of items) {
        const top = it.top - y;
        if (top > vh || top + it.height < 0) continue; // off screen
        // -1 when the element's centre is at the bottom of the screen, +1 at the top.
        const t = (vh / 2 - (top + it.height / 2)) / (vh / 2 + it.height / 2);
        it.el.style.transform = `translate3d(0, ${(t * it.speed * it.height).toFixed(1)}px, 0)`;
      }
    };

    const offLayout = onLayout(measure);
    const offScroll = onScroll(update);
    return () => {
      offLayout();
      offScroll();
    };
  }, [pathname]);

  return null;
}
