import type { CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import styles from "./LeafField.module.css";

export type Leaf = {
  /** Position within the section, as CSS lengths or percentages. */
  top: string;
  left: string;
  /** Rendered width of the sprout mark. */
  size: string;
  /** Scroll travel as a fraction of the screen height (negative moves down). */
  speed: number;
  /** Degrees turned while the section passes the screen. */
  rotate: number;
  /** Starting angle. */
  angle?: number;
  opacity?: number;
  /** Seconds for one idle sway. */
  sway?: number;
};

/**
 * Sprouts from the logo floating behind a dark section. Each one travels and turns with the
 * scroll at its own speed (MotionRoot, data-drift) and sways gently while the page is still.
 * Purely decorative and hidden from assistive technology.
 */
export function LeafField({ leaves }: { leaves: Leaf[] }) {
  return (
    <div className={styles.field} aria-hidden="true">
      {leaves.map((l, i) => (
        <span
          key={i}
          className={styles.leaf}
          data-drift=""
          data-speed={l.speed}
          data-rotate={l.rotate}
          style={
            {
              top: l.top,
              left: l.left,
              width: l.size,
              "--angle": `${l.angle ?? 0}deg`,
              "--o": l.opacity ?? 0.08,
              "--sway": `${l.sway ?? 16}s`,
              "--delay": `${-i * 2.3}s`,
            } as CSSProperties
          }
        >
          <span className={styles.sway}>
            <Logo variant="mark" className={`${styles.mark} logo-reversed`} />
          </span>
        </span>
      ))}
    </div>
  );
}
