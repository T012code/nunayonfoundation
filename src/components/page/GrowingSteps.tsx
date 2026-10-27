"use client";

import { useRef } from "react";
import { DrawSVGPlugin, gsap, MOTION_ANY, ScrollTrigger, useGSAP } from "@/lib/gsap";
import b from "./blocks.module.css";
import styles from "./GrowingSteps.module.css";

type Step = { title: string; body: string };
type Point = { x: number; y: number };

// A leaf from the logo's sprout, drawn at the origin pointing right; placed and turned along the vine.
const LEAF = "M0 0C4-7 13-9 20-4C14 1 6 3 0 0Z";

/** A gently waving curve through the points, either across a row or down a column. */
function vinePath(points: Point[], across: boolean) {
  const [first, ...rest] = points;
  const lead = across ? { x: first.x - 40, y: first.y + 14 } : { x: first.x - 14, y: first.y - 40 };
  let d = `M${lead.x} ${lead.y} Q${first.x - (across ? 14 : 0)} ${first.y - (across ? 0 : 14)} ${first.x} ${first.y}`;
  let prev = first;
  rest.forEach((p, i) => {
    const amp = (i % 2 ? -1 : 1) * 26;
    if (across) {
      const dx = (p.x - prev.x) / 3;
      d += ` C${prev.x + dx} ${prev.y - amp} ${p.x - dx} ${p.y + amp} ${p.x} ${p.y}`;
    } else {
      const dy = (p.y - prev.y) / 3;
      d += ` C${prev.x + amp} ${prev.y + dy} ${p.x - amp} ${p.y - dy} ${p.x} ${p.y}`;
    }
    prev = p;
  });
  // A short tendril beyond the last step.
  d += across ? ` q40 -6 70 -24` : ` q-6 40 -24 64`;
  return d;
}

/**
 * Numbered steps joined by a vine that grows as the visitor scrolls (GSAP DrawSVG, scrubbed).
 * Each number pops up as the vine reaches it, with a leaf unfurling between steps. Without
 * motion it's the plain numbered list.
 */
export function GrowingSteps({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_ANY, () => {
        const wrap = root.current!;
        const svg = wrap.querySelector("svg")!;
        const path = svg.querySelector<SVGPathElement>("[data-vine]")!;
        const leaves = [...svg.querySelectorAll<SVGPathElement>("[data-leaf]")];
        const nums = [...wrap.querySelectorAll<HTMLElement>("[data-num]")];
        const texts = [...wrap.querySelectorAll<HTMLElement>("[data-text]")];
        let tl: gsap.core.Timeline | null = null;

        const build = () => {
          tl?.scrollTrigger?.kill();
          tl?.kill();
          gsap.set([...nums, ...texts, ...leaves], { clearProps: "all" });
          const box = wrap.getBoundingClientRect();
          const points = nums.map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
          });
          const across = points.every((p) => Math.abs(p.y - points[0].y) < 4);
          const down = points.every((p) => Math.abs(p.x - points[0].x) < 4);
          // Steps wrapping onto several rows: no vine, just the list.
          if (!across && !down) {
            wrap.removeAttribute("data-growing");
            return;
          }
          wrap.dataset.growing = "";
          svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
          path.setAttribute("d", vinePath(points, across));

          // Leaves halfway between steps, alternating sides.
          leaves.forEach((leaf, i) => {
            const a = points[i];
            const c = points[i + 1];
            if (!a || !c) return gsap.set(leaf, { autoAlpha: 0 });
            const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 + (across ? (i % 2 ? 26 : -26) * 0.75 : 0) };
            const midX = across ? mid.x : mid.x + (i % 2 ? -26 : 26) * 0.75;
            gsap.set(leaf, { x: midX, y: mid.y, rotation: across ? (i % 2 ? 40 : -40) : i % 2 ? 140 : 40, scale: 0, transformOrigin: "0% 50%" });
          });

          // How far along the vine each step sits (by position along its main direction).
          const span = across ? points[points.length - 1].x - points[0].x + 110 : points[points.length - 1].y - points[0].y + 104;
          const at = (p: Point) => (across ? p.x - points[0].x + 40 : p.y - points[0].y + 40) / span;

          tl = gsap.timeline({
            scrollTrigger: { trigger: wrap, start: "top 78%", end: "bottom 60%", scrub: 0.8 },
          });
          // The vine's length follows the scroll one-to-one; scrub supplies the smoothing.
          tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, ease: "none" }, 0);
          points.forEach((p, i) => {
            const t = Math.min(0.97, at(p));
            tl!.from(nums[i], { scale: 0, rotation: -90, duration: 0.12, ease: "back.out(2)" }, t - 0.04);
            tl!.from(texts[i], { autoAlpha: 0, y: 24, duration: 0.16, ease: "power2.out" }, t);
            if (leaves[i] && points[i + 1]) tl!.to(leaves[i], { scale: 1, duration: 0.12, ease: "back.out(1.8)" }, (t + at(points[i + 1])) / 2);
          });
        };

        // Re-measure when the steps change size (fonts loading, resizing), a moment after it settles.
        let timer = 0;
        const ro = new ResizeObserver(() => {
          clearTimeout(timer);
          timer = window.setTimeout(() => {
            build();
            ScrollTrigger.refresh();
          }, 150);
        });
        build();
        ro.observe(wrap);
        return () => {
          ro.disconnect();
          clearTimeout(timer);
          tl?.scrollTrigger?.kill();
          tl?.kill();
          wrap.removeAttribute("data-growing");
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={styles.wrap}>
      <svg className={styles.vine} aria-hidden="true" preserveAspectRatio="none">
        <path data-vine="" className={styles.stem} />
        {steps.slice(0, -1).map((_, i) => (
          <path key={i} data-leaf="" className={styles.leaf} d={LEAF} />
        ))}
      </svg>
      <ol className={`${b.steps} ${styles.steps}`}>
        {steps.map((s, i) => (
          <li key={s.title} className={`${b.step} ${styles.step}`}>
            <span data-num="" className={styles.num} aria-hidden="true">
              {i + 1}
            </span>
            <div data-text="">
              <h3 className={b.stepTitle}>{s.title}</h3>
              <p className={b.stepBody}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Keep the plugin in the bundle (used through the drawSVG property above).
void DrawSVGPlugin;
