import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { Programme } from "@/content/site";
import styles from "./Programmes.module.css";

export function Programmes({ items }: { items: Programme[] }) {
  return (
    <section className={styles.section} aria-labelledby="programmes-title">
      <div className="wrap">
        <div className={styles.head}>
          <Reveal>
            <p className="eyebrow">What we do</p>
            <h2 id="programmes-title" className={styles.title}>
              Six programmes, one aim: families who can stand on their own.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.intro}>
              Each outreach is planned with local leaders, so help arrives where it is needed and keeps working after we
              leave.
            </p>
          </Reveal>
        </div>

        <ul className={styles.grid}>
          {items.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08}>
              <Link href={`/programmes/${p.slug}`} className={styles.card}>
                <span className={styles.media}>
                  <Picture
                    slug={p.image}
                    sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
                    className={styles.photo}
                  />
                </span>
                <span className={styles.body}>
                  <span className={styles.cardTitle}>{p.title}</span>
                  <span className={styles.summary}>{p.summary}</span>
                  <span className={styles.more}>
                    Learn more <Arrow className={styles.arrow} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className={styles.foot}>
          <ButtonLink href="/programmes" variant="ghost">
            All programmes
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
