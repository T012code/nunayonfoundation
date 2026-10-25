import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Impact.module.css";

type Stat = { value: number; suffix: string; label: string };

export function Impact({ title, stats }: { title: string; stats: Stat[] }) {
  return (
    <section className={styles.impact} aria-labelledby="impact-title">
      <div className="wrap">
        <Reveal>
          <h2 id="impact-title" className={styles.title}>
            {title}
          </h2>
        </Reveal>
        <ul className={styles.stats}>
          {stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 0.08} className={styles.stat}>
              <span className={styles.value}>
                <CountUp value={s.value} suffix={s.suffix} />
              </span>
              <span className={styles.label}>{s.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
