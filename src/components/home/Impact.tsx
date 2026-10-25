import { Logo } from "@/components/brand/Logo";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import styles from "./Impact.module.css";

type Stat = { value: number; suffix: string; label: string };

export function Impact({ title, stats }: { title: string; stats: Stat[] }) {
  return (
    <section className={styles.impact} aria-labelledby="impact-title">
      <Logo variant="mark" className={`leaf-decor logo-reversed ${styles.decor}`} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <Reveal as="p" variant="up" className={styles.eyebrow}>
          Our impact
        </Reveal>
        <h2 id="impact-title" className={styles.title} data-reveal="words">
          <Words text={title} />
        </h2>
        <ul className={styles.stats}>
          {stats.map((s, i) => (
            <li key={s.label} className={styles.stat}>
              <Reveal as="span" variant="draw" delay={0.1 + i * 0.12} className={styles.rule} />
              <Reveal as="span" variant="up" delay={0.2 + i * 0.12} className={styles.value}>
                <CountUp value={s.value} suffix={s.suffix} />
              </Reveal>
              <Reveal as="span" variant="up" delay={0.3 + i * 0.12} className={styles.label}>
                {s.label}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
