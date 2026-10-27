"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Partners.module.css";

// Placeholder tiles until partner logos are uploaded in the admin.
const PARTNERS = Array.from({ length: 6 }, (_, i) => `Partner logo ${i + 1}`);

/**
 * Logos drift past in a slow continuous strip. Hovering or focusing it pauses it, and a
 * button stops it for good (anything that moves on its own for more than five seconds needs one).
 */
export function Partners({ title }: { title: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <section className={styles.section} aria-labelledby="partners-title">
      <div className={`wrap ${styles.head}`}>
        <Reveal as="p" className={styles.title}>
          <span id="partners-title">{title}</span>
        </Reveal>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play the partner logos" : "Pause the partner logos"}
          aria-pressed={paused}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 3.5v9l7-4.5z" className={styles.solid} />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 3.5v9M10.5 3.5v9" />
            </svg>
          )}
        </button>
      </div>
      <div className={styles.marquee} data-paused={paused || undefined}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={styles.track} aria-hidden={copy === 1 || undefined}>
            {PARTNERS.map((p) => (
              <li key={p} className={styles.logo}>
                Partner logo
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
