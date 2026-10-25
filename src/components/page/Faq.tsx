import { Reveal } from "@/components/motion/Reveal";
import styles from "./Faq.module.css";

/** Questions and answers as native disclosure widgets: keyboard and screen-reader ready. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className={styles.list}>
      {items.map((item, i) => (
        <Reveal key={item.q} delay={i * 0.06}>
          <details className={styles.item}>
            <summary className={styles.q}>
              <span>{item.q}</span>
              <span className={styles.icon} aria-hidden="true" />
            </summary>
            <p className={styles.a}>{item.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
