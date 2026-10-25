"use client";

import Lenis from "lenis";

// One smooth-scroll instance and one scroll loop for the whole site.
//
// Every scroll-driven effect (hero, parallax, header) subscribes here instead of listening to
// the window itself. With smooth scrolling on, they run inside Lenis's own frame, right after
// it moves the page, so nothing trails the scroll by a frame. Without it (touch, reduced
// motion) they run once per animation frame from native scroll events.

type Listener = (y: number) => void;

let lenis: Lenis | null = null;
const scrollListeners = new Set<Listener>();
const layoutListeners = new Set<() => void>();
let frame = 0;
let wired = false;

function emitScroll() {
  frame = 0;
  const y = window.scrollY;
  for (const l of scrollListeners) l(y);
}

function queue() {
  if (!frame) frame = requestAnimationFrame(emitScroll);
}

function emitLayout() {
  for (const l of layoutListeners) l();
  queue();
}

function wire() {
  if (wired) return;
  wired = true;
  window.addEventListener(
    "scroll",
    () => {
      // Lenis reports its own scroll (below); native events cover everything else.
      if (!lenis?.isScrolling) queue();
    },
    { passive: true },
  );
  window.addEventListener("resize", emitLayout);
  // Images, fonts and reveals change the page height after load; re-measure when they do.
  new ResizeObserver(emitLayout).observe(document.body);
}

/** Runs `fn(scrollY)` on every scroll frame (and once straight away). */
export function onScroll(fn: Listener) {
  wire();
  scrollListeners.add(fn);
  fn(window.scrollY);
  return () => {
    scrollListeners.delete(fn);
  };
}

/** Runs `fn` whenever the layout may have changed (resize, content height); measure here, not per frame. */
export function onLayout(fn: () => void) {
  wire();
  layoutListeners.add(fn);
  fn();
  return () => {
    layoutListeners.delete(fn);
  };
}

export function startSmoothScroll() {
  if (lenis) return lenis;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return null;
  lenis = new Lenis({
    autoRaf: true,
    // Duration-based easing feels steadier on mouse wheels than a pure lerp.
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    wheelMultiplier: 1,
    smoothWheel: true,
    anchors: { offset: -88 },
  });
  lenis.on("scroll", () => {
    cancelAnimationFrame(frame);
    emitScroll();
  });
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

/** Glide back to the top (instantly with reduced motion), then move keyboard focus to the logo. */
export function scrollToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
}
