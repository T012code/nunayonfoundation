"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./Hero.module.css";

const SLIDE_MS = 6500;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Props = { eyebrow: string; title: string; lead: string; slides: ImageSlug[] };

/**
 * Home hero. On desktop the photo slider starts in a paper frame beside the headline and
 * opens to the full screen as the visitor scrolls; the headline turns white as the photo
 * reaches it. Only transform and opacity change. Below desktop, or with reduced motion,
 * it stays a framed slider under the headline.
 */
export function Hero({ eyebrow, title, lead, slides }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const matRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const lightCopyRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);

  // ── Scroll-driven expansion ──
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const clip = clipRef.current;
    const inner = innerRef.current;
    if (!section || !stage || !clip || !inner) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const reset = () => {
      for (const el of [clip, inner, matRef.current, scrimRef.current, lightCopyRef.current]) {
        if (el) {
          el.style.transform = "";
          el.style.opacity = "";
          el.style.clipPath = "";
        }
      }
    };

    const apply = () => {
      frame = 0;
      if (!desktop.matches || reduced.matches) return reset();
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      // Layout geometry of the frame, unaffected by the transforms we apply.
      const fx = clip.offsetLeft;
      const fy = clip.offsetTop;
      const fw = clip.offsetWidth;
      const fh = clip.offsetHeight;
      const travel = section.offsetHeight - stage.offsetHeight;
      const scrolled = -section.getBoundingClientRect().top;
      const p = travel > 0 ? clamp01(scrolled / travel) : 0;
      const e = easeInOut(clamp01(p / 0.62));
      const sx = lerp(1, W / fw, e);
      const sy = lerp(1, H / fh, e);
      const tx = lerp(0, W / 2 - (fx + fw / 2), e);
      const ty = lerp(0, H / 2 - (fy + fh / 2), e);
      const m = Math.max(sx, sy);
      clip.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sx}, ${sy})`;
      inner.style.transform = `scale(${m / sx}, ${m / sy})`;
      if (matRef.current) matRef.current.style.opacity = String(1 - clamp01(e / 0.08));
      if (scrimRef.current) scrimRef.current.style.opacity = String(clamp01((e - 0.15) / 0.5));

      // The white headline shows only where the photo sits behind it, so the text turns
      // white exactly at the photo's edge as the photo slides under it.
      const light = lightCopyRef.current;
      if (light) {
        const cx = fx + fw / 2 + tx;
        const cy = fy + fh / 2 + ty;
        const s = stage.getBoundingClientRect();
        const c = light.getBoundingClientRect();
        const left = s.left + cx - (fw * sx) / 2 - c.left;
        const right = c.right - (s.left + cx + (fw * sx) / 2);
        const top = s.top + cy - (fh * sy) / 2 - c.top;
        const bottom = c.bottom - (s.top + cy + (fh * sy) / 2);
        const overlaps = left < c.width && right < c.width && top < c.height && bottom < c.height;
        light.style.opacity = overlaps ? "1" : "0";
        light.style.clipPath = `inset(${Math.max(0, top)}px ${Math.max(0, right)}px ${Math.max(0, bottom)}px ${Math.max(0, left)}px)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  // ── Slider ── With reduced motion it waits for the visitor instead of advancing on its own.
  const reduced = useReducedMotion();
  const [playRequested, setPlayRequested] = useState(false);
  const stopped = paused || (reduced === true && !playRequested);

  useEffect(() => {
    if (stopped || hovering || slides.length < 2) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [active, stopped, hovering, slides.length]);

  const go = useCallback((i: number) => setActive((i + slides.length) % slides.length), [slides.length]);

  const copy = (tone: "dark" | "light") => (
    <>
      <p className={styles.eyebrow}>{eyebrow}</p>
      {tone === "dark" ? (
        <h1 id="hero-title" className={styles.title}>
          <Words text={title} />
        </h1>
      ) : (
        <p className={styles.title}>
          <Words text={title} />
        </p>
      )}
      <p className={styles.lead}>{lead}</p>
    </>
  );

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <div ref={stageRef} className={styles.stage}>
        <div
          ref={clipRef}
          className={styles.clip}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div ref={innerRef} className={styles.inner}>
            {slides.map((slug, i) => (
              <div key={slug} className={styles.slide} data-active={i === active || undefined} aria-hidden={i !== active}>
                <Picture slug={slug} sizes="100vw" priority={i === 0} className={styles.photo} />
              </div>
            ))}
          </div>
          <div ref={scrimRef} className={styles.scrim} aria-hidden="true" />
          <div className={styles.cover} aria-hidden="true" />
        </div>
        <div ref={matRef} className={styles.mat} aria-hidden="true" />

        <div className={styles.copy}>
          <div className={styles.copyDark}>
            {copy("dark")}
          </div>
          <div ref={lightCopyRef} className={styles.copyLight} aria-hidden="true">
            {copy("light")}
          </div>
          <div className={styles.actions}>
            <ButtonLink href="/donate" variant="cta">
              Donate
            </ButtonLink>
            <ButtonLink href="/programmes" variant="paper">
              See our work
            </ButtonLink>
          </div>
        </div>

        {slides.length > 1 ? (
          <div className={styles.controls} role="group" aria-label="Photo slideshow">
            <button type="button" className={styles.step} onClick={() => go(active - 1)} aria-label="Previous photo">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
            </button>
            <span className={styles.count} aria-live="polite">
              <span className="visually-hidden">Photo </span>
              {active + 1} <span aria-hidden="true">/</span>
              <span className="visually-hidden"> of </span> {slides.length}
            </span>
            <button type="button" className={styles.step} onClick={() => go(active + 1)} aria-label="Next photo">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
            </button>
            <button
              type="button"
              className={styles.step}
              onClick={() => {
                if (stopped) {
                  setPaused(false);
                  setPlayRequested(true);
                } else {
                  setPaused(true);
                }
              }}
              aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={stopped}
            >
              {stopped ? (
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9l7-4.5z" className={styles.solid} /></svg>
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
              )}
            </button>
            <span className={styles.progress} aria-hidden="true">
              <span key={`${active}-${stopped || hovering}`} data-running={!(stopped || hovering) || undefined} />
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
