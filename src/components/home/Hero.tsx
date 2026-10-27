"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { onLayout, onScroll } from "@/lib/scroll";
import { Picture } from "@/components/ui/Picture";
import { imageKey, type ImageRef } from "@/content/images";
import styles from "./Hero.module.css";

const SLIDE_MS = 6500;
// How far the photo's edge sits inside the frame's 10px paper border, in px.
const TUCK = 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
// Sine in-out: starts and settles softly but never rushes (peak speed 1.6x the scroll, not 3x).
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
// Share of the hero's scroll spent opening the photo; the rest holds it full screen.
const OPEN = 0.72;

type Props = { title: string; lead: string; slides: ImageRef[] };

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
  const darkCopyRef = useRef<HTMLDivElement>(null);
  const lightCopyRef = useRef<HTMLDivElement>(null);
  const lightClipRef = useRef<HTMLDivElement>(null);
  const lightInnerRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);

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
    const dark = darkCopyRef.current;
    const light = lightCopyRef.current;
    const lightClip = lightClipRef.current;
    const lightInner = lightInnerRef.current;
    const scrim = scrimRef.current;
    const cornerBox = cornersRef.current;
    if (!section || !stage || !clip || !inner || !mat || !dark || !light || !lightClip || !lightInner || !scrim || !cornerBox) return;
    const corners = [...cornerBox.children] as HTMLElement[];

    const desktop = window.matchMedia("(min-width: 64rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let last = -1;
    const g = { start: 0, travel: 1, W: 1, H: 1, fx: 0, fy: 0, fw: 1, fh: 1, lx: 0, ly: 0, lw: 0, lh: 0, r: 0 };

    const reset = () => {
      delete stage.dataset.ready;
      for (const el of [clip, inner, mat, scrim, light, lightClip, lightInner, ...corners]) {
        el.style.transform = "";
        el.style.opacity = "";
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
      // Exact (fractional) bounds, then the photo's edge is tucked under the paper border so
      // sub-pixel rounding can never show a sliver of photo outside the frame.
      const s = stage.getBoundingClientRect();
      const f = mat.getBoundingClientRect();
      g.fx = f.left - s.left + TUCK;
      g.fy = f.top - s.top + TUCK;
      g.fw = f.width - 2 * TUCK;
      g.fh = f.height - 2 * TUCK;
      // The photo's corner follows the frame's rounded corner, inset by the tuck. The corners
      // are drawn by four small paper pieces (sized in CSS to the same radius) rather than a
      // border-radius on the photo, which would repaint the full-screen photo every frame.
      g.r = Math.max(0, parseFloat(getComputedStyle(mat).borderTopLeftRadius) - TUCK);
      // The dark copy shares the white copy's box and is never moved.
      const c = dark.getBoundingClientRect();
      g.lx = c.left - s.left;
      g.ly = c.top - s.top;
      g.lw = c.width;
      g.lh = c.height;
    };

    const update = (y: number) => {
      if (!active) return;
      const p = clamp01((y - g.start) / g.travel);
      const e = easeInOut(clamp01(p / OPEN));
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
      // Corner pieces ride on the photo's corners and shrink away as it fills the screen.
      const hw = (W * sx) / 2;
      const hh = (H * sy) / 2;
      const k = (1 - e).toFixed(4);
      // Each piece reaches 1px past the photo's edge to cover its anti-aliased rim.
      const xs = [cx - hw - 1, cx + hw - g.r];
      const ys = [cy - hh - 1, cy + hh - g.r];
      corners.forEach((el, i) => {
        el.style.transform = `translate3d(${xs[i & 1].toFixed(2)}px, ${ys[i >> 1].toFixed(2)}px, 0) scale(${k})`;
      });
      mat.style.opacity = String(1 - clamp01(e / 0.08));
      scrim.style.opacity = String(clamp01((e - 0.15) / 0.5));

      // The white headline shows only where the photo sits behind it, so the text turns
      // white exactly at the photo's edge as the photo slides under it. The cut is made by two
      // nested overflow boxes shifted with translate (one trims left and top, the other right
      // and bottom) and the text shifted back, so it never repaints. A clip-path here would
      // repaint the whole page on every scroll frame.
      const left = cx - hw - lx;
      const right = lx + lw - (cx + hw);
      const top = cy - hh - ly;
      const bottom = ly + lh - (cy + hh);
      const overlaps = left < lw && right < lw && top < lh && bottom < lh;
      light.style.opacity = overlaps ? "1" : "0";
      if (overlaps) {
        const l = Math.max(0, left);
        const r = Math.max(0, right);
        const t = Math.max(0, top);
        const b = Math.max(0, bottom);
        light.style.transform = `translate3d(${l.toFixed(2)}px, ${t.toFixed(2)}px, 0)`;
        lightClip.style.transform = `translate3d(${(-l - r).toFixed(2)}px, ${(-t - b).toFixed(2)}px, 0)`;
        lightInner.style.transform = `translate3d(${r.toFixed(2)}px, ${b.toFixed(2)}px, 0)`;
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

  // ── Swipe (touch) ── The photo follows the finger 1:1; letting go past a fifth of the width,
  // or with a flick, moves to the next photo, otherwise it springs back. Vertical drags stay
  // with the page (touch-action: pan-y in CSS).
  const drag = useRef<{ id: number; x: number; y: number; axis: "" | "x" | "y"; dx: number; v: number; t: number; el: HTMLElement | null } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch" || slides.length < 2) return;
    const el = e.currentTarget.querySelector<HTMLElement>("[data-active]");
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: "", dx: 0, v: 0, t: e.timeStamp, el };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id || !d.el) return;
    const dx = e.clientX - d.x;
    if (!d.axis) {
      if (Math.abs(dx) < 8 && Math.abs(e.clientY - d.y) < 8) return;
      d.axis = Math.abs(dx) > Math.abs(e.clientY - d.y) ? "x" : "y";
      if (d.axis === "y") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setHovering(true);
      d.el.style.transition = "none";
    }
    if (d.axis !== "x") return;
    const dt = Math.max(1, e.timeStamp - d.t);
    d.v = (dx - d.dx) / dt;
    d.dx = dx;
    d.t = e.timeStamp;
    d.el.style.transform = `translate3d(${dx}px, 0, 0)`;
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (d.axis !== "x" || !d.el) return;
    setHovering(false);
    const el = d.el;
    const width = e.currentTarget.getBoundingClientRect().width;
    const dir = d.dx < -width * 0.2 || d.v < -0.45 ? 1 : d.dx > width * 0.2 || d.v > 0.45 ? -1 : 0;
    el.style.transition = "";
    if (dir) {
      // The photo carries on in the swipe's direction while the next one fades in.
      el.style.transform = `translate3d(${-dir * width * 0.35}px, 0, 0)`;
      window.setTimeout(() => (el.style.transform = ""), 1200);
      go(active + dir);
    } else {
      el.style.transform = "";
    }
  };

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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <div ref={innerRef} className={styles.inner}>
            {slides.map((slug, i) => (
              <div key={imageKey(slug)} className={styles.slide} data-active={i === active || undefined} aria-hidden={i !== active}>
                <Picture image={slug} sizes="100vw" priority={i === 0} className={styles.photo} />
              </div>
            ))}
          </div>
          <div ref={scrimRef} className={styles.scrim} aria-hidden="true" />
          <div className={styles.cover} aria-hidden="true" />
        </div>
        <div ref={cornersRef} className={styles.corners} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div ref={matRef} className={styles.mat} aria-hidden="true" />

        <div className={styles.copy}>
          <div ref={darkCopyRef} className={styles.copyDark}>
            {copy("dark")}
          </div>
          <div ref={lightCopyRef} className={styles.copyLight} aria-hidden="true">
            <div ref={lightClipRef} className={styles.lightLayer}>
              <div ref={lightInnerRef} className={styles.lightLayer}>
                {copy("light")}
              </div>
            </div>
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
