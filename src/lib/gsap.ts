"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onScroll } from "@/lib/scroll";

// GSAP for the few effects CSS can't do well: a pinned sideways scroll, layout morphs
// (Flip) and drawing a path along the scroll (DrawSVG). Imported only by the components
// that use it, so other pages don't download it.

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, DrawSVGPlugin);

// The site's eases, as GSAP curves (see --ease-out-expo and --ease-in-out in globals.css).
gsap.defaults({ ease: "expo.out", duration: 0.9 });

// Smooth scrolling moves the page inside its own frame; tell ScrollTrigger in that same frame
// so pinned and scrubbed effects never trail the scroll.
let synced = false;
if (typeof window !== "undefined" && !synced) {
  synced = true;
  onScroll(() => ScrollTrigger.update());
}

/** Animations only for people who haven't asked for less motion, at a given minimum width. */
export const MOTION_DESKTOP = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
export const MOTION_ANY = "(prefers-reduced-motion: no-preference)";

export { gsap, useGSAP, ScrollTrigger, Flip, DrawSVGPlugin };
