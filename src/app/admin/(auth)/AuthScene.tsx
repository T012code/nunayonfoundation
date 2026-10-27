"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SplitText } from "gsap/SplitText";
import { Logo } from "@/components/brand/Logo";
import { LeafField, type Leaf } from "@/components/motion/LeafField";
import { Picture } from "@/components/ui/Picture";
import { gsap, useGSAP } from "@/lib/gsap";
import { COLUMNS } from "./columns";
import { usePressStates } from "@/lib/usePressStates";
import styles from "./auth.module.css";

gsap.registerPlugin(SplitText);

const SPEEDS = [64, 78, 56];

const LEAVES: Leaf[] = [
  { top: "8%", left: "72%", size: "clamp(6rem, 9vw, 9rem)", speed: 0, rotate: 0, angle: 18, opacity: 0.16, sway: 13 },
  { top: "46%", left: "-4%", size: "clamp(4rem, 6vw, 6rem)", speed: 0, rotate: 0, angle: -28, opacity: 0.14, sway: 10 },
  { top: "64%", left: "58%", size: "clamp(2.5rem, 3.5vw, 3.5rem)", speed: 0, rotate: 0, angle: 32, opacity: 0.2, sway: 8 },
];

/** Tell the scene what happened in the form: a wrong password shakes the card, a sign-in speeds up the photos. */
export function signal(event: "error" | "success") {
  window.dispatchEvent(new Event(`auth:${event}`));
}

/**
 * The sign-in screens' stage (GSAP). On load the photo columns rise in from opposite sides,
 * the sprout springs up, the headline rises line by line, then the card lifts in and its
 * fields follow one by one. The photos keep drifting (a button pauses them); a wrong password shakes the card and
 * signing in sends the photos rushing past. With reduced motion everything simply appears.
 */
export function AuthScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const driftTimeline = useRef<gsap.core.Timeline | null>(null);
  const [still, setStill] = useState(false);
  usePressStates();

  // The photos drift until stopped; the button pauses and resumes them.
  const toggleDrift = () => {
    setStill((s) => {
      if (s) driftTimeline.current?.play();
      else driftTimeline.current?.pause();
      return !s;
    });
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const columns = q("[data-column]");
        const tracks = q("[data-track]");
        const card = q("[data-card]")[0];
        const cardItems = q("[data-card] > *:not(form), [data-card] > form > *, [data-card] > div > form > *");

        // Constant-speed drift, as in a marquee: linear on purpose, so the loop has no visible seam.
        const drift = gsap.timeline();
        driftTimeline.current = drift;
        tracks.forEach((track, i) => {
          const down = i === 1;
          drift.fromTo(
            track,
            { yPercent: down ? -50 : 0 },
            { yPercent: down ? 0 : -50, duration: SPEEDS[i], ease: "none", repeat: -1 },
            0,
          );
        });

        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(columns, { yPercent: (i: number) => (i === 1 ? -18 : 18), autoAlpha: 0, duration: 1.8, stagger: 0.12 }, 0)
          .from(q("[data-tile] img"), { scale: 1.25, duration: 2.4, stagger: { each: 0.03, from: "random" } }, 0)
          .from(q("[data-veil]"), { autoAlpha: 0, duration: 1.4, ease: "power2.out" }, 0.1)
          .from(q("[data-sprout]"), { autoAlpha: 0, scale: 0, rotation: -25, transformOrigin: "50% 100%", duration: 1.3, ease: "back.out(2.4)" }, 0.55)
          .from(q("[data-sub]"), { autoAlpha: 0, y: 14, duration: 1 }, 1.35)
          .from(card, { autoAlpha: 0, y: 70, scale: 0.94, rotation: 1.5, transformOrigin: "50% 100%", duration: 1.3 }, 0.3)
          // Cleared afterwards: buttons have their own hover transitions on transform.
          .from(cardItems, { autoAlpha: 0, y: 22, duration: 0.9, stagger: 0.07, clearProps: "transform,opacity,visibility" }, 0.6)
          .from(q("[data-glow]"), { autoAlpha: 0, scale: 0.4, duration: 2.2, ease: "power3.out" }, 0.2);

        // The headline rises line by line from behind a mask, once the font is ready.
        let split: SplitText | null = null;
        document.fonts.ready.then(() => {
          const headline = q("[data-headline]")[0];
          if (!headline) return;
          split = SplitText.create(headline, { type: "lines,words", mask: "lines" });
          gsap.from(split.words, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: Math.max(0, 0.75 - intro.time()) });
          gsap.set(headline, { autoAlpha: 1 });
        });

        // Ambient life: the sprout sways, the glow breathes.
        gsap.fromTo(q("[data-sprout] svg"), { rotation: -4 }, { rotation: 4, transformOrigin: "50% 100%", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(q("[data-glow]"), { xPercent: 6, yPercent: 4, scale: 1.08, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });

        const onError = () => {
          gsap.fromTo(card, { x: 0 }, { keyframes: { x: [-12, 10, -6, 3, 0] }, duration: 0.5, ease: "power2.out" });
        };
        const onSuccess = () => {
          // The photos rush past as the dashboard opens.
          drift.play();
          gsap.to(drift, { timeScale: 7, duration: 1.4, ease: "power2.in" });
          gsap.to(q("[data-veil]"), { opacity: 0.6, duration: 1.2 });
        };
        window.addEventListener("auth:error", onError);
        window.addEventListener("auth:success", onSuccess);
        return () => {
          window.removeEventListener("auth:error", onError);
          window.removeEventListener("auth:success", onSuccess);
          split?.revert();
          driftTimeline.current = null;
        };
      });

      // Reduced motion (or the query not matching yet): just show everything.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-card], [data-headline]"), { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.shell}>
      <aside className={styles.art}>
        <div className={styles.reel} aria-hidden="true">
          {COLUMNS.map((col, c) => (
            <div key={c} data-column="" className={styles.column} style={{ "--c": c } as CSSProperties}>
              <div data-track="" className={styles.track}>
                {[...col, ...col].map((slug, i) => (
                  <div key={i} data-tile="" className={styles.tile}>
                    <Picture image={slug} sizes="(min-width: 64rem) 16vw, 34vw" alt="" className={styles.photo} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div data-veil="" className={styles.veil} aria-hidden="true" />
        <LeafField leaves={LEAVES} />
        <button
          type="button"
          data-sub=""
          className={styles.still}
          onClick={toggleDrift}
          aria-label={still ? "Play the moving photos" : "Pause the moving photos"}
          aria-pressed={still}
        >
          {still ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 3.5v9l7-4.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 3.5v9M10.5 3.5v9" />
            </svg>
          )}
        </button>
        <div className={styles.copy} aria-hidden="true">
          <div data-sprout="" className={styles.sprout}>
            <Logo variant="mark" className="logo-reversed" />
          </div>
          <p data-headline="" className={styles.headline}>
            Every change you make here reaches a family.
          </p>
          <p data-sub="" className={styles.sub}>
            Nunayon Foundation · Team admin
          </p>
        </div>
      </aside>

      <section className={styles.panel}>
        <div className={styles.glowBox} aria-hidden="true">
          <div data-glow="" className={styles.glow} />
        </div>
        <div data-card="" className={styles.card}>
          <Logo variant="stacked" className={styles.logo} />
          {children}
        </div>
      </section>
    </main>
  );
}
