import type { CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { LeafField, type Leaf } from "@/components/motion/LeafField";
import { Words } from "@/components/motion/Words";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./auth.module.css";

// Three columns of photos from the field, each drifting at its own pace (alternate columns
// move the other way). Every list is shown twice so the loop has no seam.
const COLUMNS: ImageSlug[][] = [
  ["children-waving", "classroom-smiles", "sewing-lagos", "health-check", "kids-pump"],
  ["volunteer-children", "students-reading", "medical-outreach", "women-gathering", "computer-class"],
  ["smiling-children", "relief-supplies", "boy-uniform", "health-children", "village-group"],
];

const LEAVES: Leaf[] = [
  { top: "8%", left: "72%", size: "clamp(6rem, 9vw, 9rem)", speed: 0, rotate: 0, angle: 18, opacity: 0.16, sway: 13 },
  { top: "46%", left: "-4%", size: "clamp(4rem, 6vw, 6rem)", speed: 0, rotate: 0, angle: -28, opacity: 0.14, sway: 10 },
  { top: "64%", left: "58%", size: "clamp(2.5rem, 3.5vw, 3.5rem)", speed: 0, rotate: 0, angle: 32, opacity: 0.2, sway: 8 },
];

/** Sign-in, two-step code, forgot and set password: photos in motion beside the card. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.shell}>
      <aside className={styles.art} aria-hidden="true">
        <div className={styles.reel}>
          {COLUMNS.map((col, c) => (
            <div key={c} className={styles.column} style={{ "--c": c } as CSSProperties}>
              <div className={styles.track}>
                {[...col, ...col].map((slug, i) => (
                  <div key={i} className={styles.tile}>
                    <Picture image={slug} sizes="(min-width: 64rem) 16vw, 34vw" alt="" className={styles.photo} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.veil} />
        <LeafField leaves={LEAVES} />
        <div className={styles.copy}>
          <div className={styles.sprout}>
            <Logo variant="mark" className="logo-reversed" />
          </div>
          <p className={styles.headline}>
            <Words text="Every change you make here reaches a family." />
          </p>
          <p className={styles.sub}>Nunayon Foundation · Team admin</p>
        </div>
      </aside>

      <section className={styles.panel}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.card}>
          <Logo variant="stacked" className={styles.logo} />
          {children}
        </div>
      </section>
    </main>
  );
}
