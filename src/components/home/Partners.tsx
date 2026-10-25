import { Reveal } from "@/components/motion/Reveal";
import styles from "./Partners.module.css";

// Placeholder tiles until partner logos are uploaded in the admin.
const PARTNERS = Array.from({ length: 6 }, (_, i) => `Partner logo ${i + 1}`);

/** Logos drift past in a slow continuous strip; hovering pauses it. */
export function Partners() {
  return (
    <section className={styles.section} aria-labelledby="partners-title">
      <div className={`wrap ${styles.head}`}>
        <Reveal as="p" className={styles.title}>
          <span id="partners-title">Partners and friends who make outreaches possible</span>
        </Reveal>
      </div>
      <div className={styles.marquee}>
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
