"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Whether the visitor asked for less motion. The server (and the first client render, while
 * hydrating) answers false, then React re-renders with the real value, so the markup never
 * differs between server and browser.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
