"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const format = (n: number) => Math.round(n).toLocaleString("en-NG");
const noop = () => () => {};

/** Counts up to `value` once, when it first scrolls into view. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  // False while hydrating (matching the server's HTML), true afterwards.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [inView, reduced, value]);

  // With reduced motion the final figure shows straight away (once hydrated, so the first
  // render matches the server's).
  const display = hydrated && reduced ? value : shown;

  return (
    <span ref={ref}>
      {/* Screen readers get the final figure, not every frame of the count. */}
      <span aria-hidden="true">
        {format(display)}
        {suffix}
      </span>
      <span className="visually-hidden">
        {format(value)}
        {suffix}
      </span>
    </span>
  );
}
