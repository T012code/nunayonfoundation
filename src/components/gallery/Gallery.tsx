"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Picture } from "@/components/ui/Picture";
import type { Album } from "@/content/pages";
import { imageKey } from "@/content/images";
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
  const touchX = useRef<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

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

  const go = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + shown.length) % shown.length)), [shown.length]);

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
              onClick={() => setFilter(a.slug)}
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

      {/* Re-keyed on filter change so the photos animate in again. */}
      <ul key={filter} className={styles.grid}>
        {shown.map((p, i) => (
          <li key={`${imageKey(p.image)}-${i}`} className={styles.item} style={{ "--i": i } as CSSProperties}>
            <button type="button" className={styles.thumb} onClick={() => setOpen(i)} aria-label={`Open photo: ${p.caption}`}>
              <Picture image={p.image} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw" className={styles.photo} alt="" />
              <span className={styles.caption} aria-hidden="true">
                <span className={styles.album}>{p.album}</span>
                {p.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className={styles.viewer}
        aria-label="Photo viewer"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current ? (
          <figure key={open} className={styles.figure}>
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
        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous photo">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
        </button>
        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Next photo">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
        </button>
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close viewer" autoFocus>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      </dialog>
    </>
  );
}
