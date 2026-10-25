"use client";

import Lenis from "lenis";

// One smooth-scroll instance for the whole site (desktop pointers only; touch scrolls natively).
let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (lenis) return lenis;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return null;
  lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -88 } });
  return lenis;
}

export function stopSmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

/** Pause or resume scrolling (used while the menu pins the page). */
export function lockScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Jump straight to a position, keeping smooth scroll in step. */
export function jumpTo(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: "instant" });
}
