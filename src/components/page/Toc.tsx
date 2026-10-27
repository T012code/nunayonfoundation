"use client";

import { useEffect, useState } from "react";
import styles from "./Toc.module.css";

/**
 * "On this page" links for long pages. The section being read is highlighted as the visitor
 * scrolls. An index on hairlines on small screens, a sticky list beside the text on large ones.
 */
export function Toc({ items, label = "On this page" }: { items: { id: string; label: string }[]; label?: string }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    const visible = new Set<string>();
    // A section counts as "being read" while it crosses a band just below the header.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={styles.toc} aria-label={label}>
      <p className={styles.label}>{label}</p>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.link} aria-current={item.id === current ? "location" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
