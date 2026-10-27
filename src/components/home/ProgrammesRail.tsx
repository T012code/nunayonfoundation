"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_DESKTOP, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * On large screens the programmes section pins in place and its cards travel sideways as the
 * visitor scrolls down; each photo drifts inside its frame, and a line fills as they go. The
 * markup stays a normal list, so small screens, reduced motion and no-JS get the grid.
 */
export function ProgrammesRail({ className, children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_DESKTOP, () => {
        const section = root.current!;
        const track = section.querySelector<HTMLElement>("[data-rail-track]")!;
        const frame = track.parentElement!;
        const bar = section.querySelector<HTMLElement>("[data-rail-bar]");
        section.dataset.rail = "";
        const distance = () => Math.max(0, track.scrollWidth - frame.clientWidth);

        // Scroll position maps straight onto the slide, so the mapping itself is linear;
        // the scrub smooths it.
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // A little more scroll than slide, so the cards travel at an unhurried pace.
            end: () => `+=${distance() * 1.4}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
          },
        });

        // Each photo slides a little against the card's own movement.
        for (const img of track.querySelectorAll<HTMLElement>("[data-rail-img]")) {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: img, containerAnimation: slide, start: "left right", end: "right left", scrub: true },
            },
          );
        }

        ScrollTrigger.refresh();
        return () => {
          delete section.dataset.rail;
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={className} aria-labelledby="programmes-title">
      {children}
    </section>
  );
}
