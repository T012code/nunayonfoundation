"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { onLayout, onScroll } from "@/lib/scroll";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./Hero.module.css";

const SLIDE_MS = 6500;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Props = { title: string; lead: string; slides: ImageSlug[] };

/**
 * Home hero. On desktop the photo slider starts in a paper frame beside the headline and
 * opens to the full screen as the visitor scrolls; the headline turns white as the photo
 * reaches it. Only transform and opacity change. Below desktop, or with reduced motion,
 * it stays a framed slider under the headline.
 */
export function Hero({ title, lead, slides }: Props) {
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
  // Once running, the photo layer is full-screen in the layout and starts scaled down onto the
  // frame, so it is drawn at full resolution and ends with no transform at all. Positions are measured on
  // layout changes only; each scroll frame is arithmetic plus a few style writes.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const clip = clipRef.current;
    const inner = innerRef.current;
    const mat = matRef.current;
    const light = lightCopyRef.current;
    const scrim = scrimRef.current;
    if (!section || !stage || !clip || !inner || !mat || !light || !scrim) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let last = -1;
    const g = { start: 0, travel: 1, W: 1, H: 1, fx: 0, fy: 0, fw: 1, fh: 1, lx: 0, ly: 0, lw: 0, lh: 0 };

    const reset = () => {
      delete stage.dataset.ready;
      for (const el of [clip, inner, mat, scrim, light]) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.clipPath = "";
      }
    };

    const measure = () => {
      active = desktop.matches && !reduced.matches;
      last = -1;
      if (!active) return reset();
      // Switch the photo layer to full screen; update() scales it onto the frame in the same task.
      stage.dataset.ready = "";
      const y = window.scrollY;
      const stageTop = parseFloat(getComputedStyle(stage).top) || 0;
      g.start = section.getBoundingClientRect().top + y - stageTop;
      g.travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      g.W = stage.clientWidth;
      g.H = stage.clientHeight;
      // The mat sits exactly where the frame is and is never moved, so it gives the geometry.
      g.fx = mat.offsetLeft;
      g.fy = mat.offsetTop;
      g.fw = mat.offsetWidth;
      g.fh = mat.offsetHeight;
      const s = stage.getBoundingClientRect();
      const c = light.getBoundingClientRect();
      g.lx = c.left - s.left;
      g.ly = c.top - s.top;
      g.lw = c.width;
      g.lh = c.height;
    };

    const update = (y: number) => {
      if (!active) return;
      const p = clamp01((y - g.start) / g.travel);
      const e = easeInOut(clamp01(p / 0.62));
      if (e === last) return;
      last = e;
      const { W, H, fx, fy, fw, fh, lx, ly, lw, lh } = g;
      const sx = lerp(fw / W, 1, e);
      const sy = lerp(fh / H, 1, e);
      const cx = lerp(fx + fw / 2, W / 2, e);
      const cy = lerp(fy + fh / 2, H / 2, e);
      const m = Math.max(sx, sy);
      clip.style.transform = `translate3d(${(cx - W / 2).toFixed(2)}px, ${(cy - H / 2).toFixed(2)}px, 0) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`;
      inner.style.transform = `scale(${(m / sx).toFixed(5)}, ${(m / sy).toFixed(5)})`;
      mat.style.opacity = String(1 - clamp01(e / 0.08));
      scrim.style.opacity = String(clamp01((e - 0.15) / 0.5));

      // The white headline shows only where the photo sits behind it, so the text turns
      // white exactly at the photo's edge as the photo slides under it.
      const left = cx - (W * sx) / 2 - lx;
      const right = lx + lw - (cx + (W * sx) / 2);
      const top = cy - (H * sy) / 2 - ly;
      const bottom = ly + lh - (cy + (H * sy) / 2);
      const overlaps = left < lw && right < lw && top < lh && bottom < lh;
      light.style.opacity = overlaps ? "1" : "0";
      if (overlaps) {
        light.style.clipPath = `inset(${Math.max(0, top).toFixed(1)}px ${Math.max(0, right).toFixed(1)}px ${Math.max(0, bottom).toFixed(1)}px ${Math.max(0, left).toFixed(1)}px)`;
      }
    };

    const offLayout = onLayout(measure);
    const offScroll = onScroll(update);
    const onChange = () => {
      measure();
      update(window.scrollY);
    };
    desktop.addEventListener("change", onChange);
    reduced.addEventListener("change", onChange);
    return () => {
      offLayout();
      offScroll();
      desktop.removeEventListener("change", onChange);
      reduced.removeEventListener("change", onChange);
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
