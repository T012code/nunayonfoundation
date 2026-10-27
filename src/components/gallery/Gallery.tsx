"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Picture } from "@/components/ui/Picture";
import type { Album } from "@/content/pages";
import { imageKey } from "@/content/images";
import { Flip, gsap, useGSAP } from "@/lib/gsap";
import { lockScroll } from "@/lib/scroll";
import styles from "./Gallery.module.css";

type Photo = Album["photos"][number] & { album: string };

/**
 * Filterable photo grid with a full-screen viewer. The viewer is a native <dialog>, so focus
 * stays inside it and Escape closes it; arrow keys and swipes move between photos.
 */
export function Gallery({ albums }: { albums: Album[] }) {
  const all = useMemo<Photo[]>(() => albums.flatMap((a) => a.photos.map((p) => ({ ...p, album: a.title }))), [albums]);
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? all : all.filter((p) => albums.find((a) => a.slug === filter)?.title === p.album);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // Swipe in the viewer: the photo follows the finger, then moves on or springs back.
  const drag = useRef<{ id: number; x: number; y: number; axis: "" | "x" | "y"; dx: number; v: number; t: number; el: HTMLElement | null } | null>(null);
  const [enter, setEnter] = useState<"next" | "prev" | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const heightBefore = useRef(0);
  const [settled, setSettled] = useState(false);

  // Switching album: remember where every photo is, change the filter, then let Flip glide
  // the photos that stay into their new places while the others fade out and new ones grow in.
  const choose = (slug: string) => {
    if (slug === filter) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    flipState.current = reduced || !gridRef.current ? null : Flip.getState(gridRef.current.children);
    heightBefore.current = gridRef.current?.offsetHeight ?? 0;
    setSettled(true);
    setFilter(slug);
  };

  useGSAP(
    () => {
      const state = flipState.current;
      const grid = gridRef.current;
      if (!state || !grid) return;
      flipState.current = null;
      // While photos fly, they're lifted out of the layout; hold the list's height so the
      // rest of the page doesn't jump up underneath them.
      grid.style.minHeight = `${heightBefore.current}px`;
      Flip.from(state, {
        onComplete: () => {
          grid.style.minHeight = "";
        },
        duration: 0.75,
        ease: "power3.inOut",
        absolute: true,
        stagger: 0.015,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.03, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.35, ease: "power2.in" }),
      });
    },
    { dependencies: [filter], scope: gridRef },
  );

  // The underline slides to the chosen album (transform only) and the row scrolls it into view.
  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const bar = barRef.current;
    if (!tabs || !bar) return;
    const place = () => {
      const btn = tabs.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!btn) return;
      bar.style.transform = `translate3d(${btn.offsetLeft}px, 0, 0) scaleX(${btn.offsetWidth})`;
      const target = btn.offsetLeft - (tabs.clientWidth - btn.offsetWidth) / 2;
      tabs.scrollTo({ left: target, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(tabs);
    return () => ro.disconnect();
  }, [filter]);

  const go = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) {
      d.showModal();
      lockScroll(true);
    }
    if (open === null && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => {
      setOpen(null);
      lockScroll(false);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const current = open !== null ? shown[open] : null;

  const step = (dir: 1 | -1) => {
    setEnter(dir === 1 ? "next" : "prev");
    go(dir);
  };

  const endDrag = (id: number) => {
    const d = drag.current;
    if (!d || id !== d.id) return;
    drag.current = null;
    if (d.axis !== "x" || !d.el) return;
    const width = window.innerWidth;
    const dir = d.dx < -width * 0.2 || d.v < -0.45 ? 1 : d.dx > width * 0.2 || d.v > 0.45 ? -1 : 0;
    if (dir) {
      // The next photo slides in from the side the finger was moving away from.
      setEnter(dir === 1 ? "next" : "prev");
      go(dir);
      return;
    }
    const el = d.el;
    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
  };

  return (
    <>
      <div className={styles.filters}>
        <div ref={tabsRef} className={styles.tabs} role="group" aria-label="Filter by album">
          {[{ slug: "all", title: "All photos" }, ...albums].map((a) => (
            <button
              key={a.slug}
              type="button"
              className={styles.filter}
              aria-pressed={filter === a.slug}
              onClick={() => choose(a.slug)}
            >
              {a.title}
              <span className={styles.count}>
                <span className="visually-hidden">, </span>
                {a.slug === "all" ? all.length : albums.find((x) => x.slug === a.slug)?.photos.length}
                <span className="visually-hidden"> photos</span>
              </span>
            </button>
          ))}
          <span ref={barRef} className={styles.bar} aria-hidden="true" />
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        Showing {shown.length} photos
      </p>

      {/* Every photo stays in the page; those outside the chosen album are hidden, so Flip can
          move the rest from where they were. */}
      <ul ref={gridRef} className={styles.grid} data-settled={settled || undefined}>
        {all.map((p, i) => {
          const index = shown.indexOf(p);
          return (
            <li
              key={`${imageKey(p.image)}-${i}`}
              className={styles.item}
              hidden={index < 0}
              style={{ "--i": i } as CSSProperties}
            >
              <button
                type="button"
                className={styles.thumb}
                onClick={() => {
                  setEnter(null);
                  setOpen(index);
                }}
                aria-label={`Open photo: ${p.caption}`}
              >
                <Picture
                  image={p.image}
                  sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
                  className={styles.photo}
                  alt=""
                />
                <span className={styles.caption} aria-hidden="true">
                  <span className={styles.album}>{p.album}</span>
                  {p.caption}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        className={styles.viewer}
        aria-label="Photo viewer"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch" || shown.length < 2) return;
          const el = e.currentTarget.querySelector<HTMLElement>("figure");
          drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: "", dx: 0, v: 0, t: e.timeStamp, el };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || e.pointerId !== d.id || !d.el) return;
          const dx = e.clientX - d.x;
          if (!d.axis) {
            if (Math.abs(dx) < 8 && Math.abs(e.clientY - d.y) < 8) return;
            d.axis = Math.abs(dx) > Math.abs(e.clientY - d.y) ? "x" : "y";
            if (d.axis === "y") return;
            d.el.style.animation = "none";
            d.el.style.transition = "none";
          }
          if (d.axis !== "x") return;
          d.v = (dx - d.dx) / Math.max(1, e.timeStamp - d.t);
          d.dx = dx;
          d.t = e.timeStamp;
          d.el.style.transform = `translate3d(${dx}px, 0, 0)`;
          d.el.style.opacity = String(1 - Math.min(0.5, Math.abs(dx) / window.innerWidth));
        }}
        onPointerUp={(e) => endDrag(e.pointerId)}
        onPointerCancel={(e) => endDrag(e.pointerId)}
      >
        {current ? (
          <figure key={open} className={styles.figure} data-enter={enter ?? undefined}>
            <Picture image={current.image} sizes="92vw" className={styles.full} alt={current.caption} priority />
            <figcaption className={styles.figcaption}>
              <span>
                <span className={styles.album}>{current.album}</span>
                {current.caption}
              </span>
              <span className={styles.position}>
                {open! + 1} / {shown.length}
              </span>
            </figcaption>
          </figure>
        ) : null}
        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous photo">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
        </button>
        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => step(1)} aria-label="Next photo">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialog.current?.close()}
          aria-label="Close viewer"
          autoFocus
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </dialog>
    </>
  );
}
