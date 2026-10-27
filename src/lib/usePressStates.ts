"use client";

import { useEffect } from "react";

/** iOS Safari only shows :active (press) styles once the page listens for touches. */
export function usePressStates() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);
}
