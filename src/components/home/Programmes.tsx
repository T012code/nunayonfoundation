import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { Arrow } from "@/components/ui/Arrow";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { Programme } from "@/content/site";
import { ProgrammesRail } from "./ProgrammesRail";
import styles from "./Programmes.module.css";

export function Programmes({ items }: { items: Programme[] }) {
  return (
    <ProgrammesRail className={styles.section}>
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <Reveal as="p" className="eyebrow">
              What we do
            </Reveal>
            <h2 id="programmes-title" className={styles.title} data-reveal="words">
              <Words text="Every programme, one aim: families who can stand on their own." />
            </h2>
          </div>
          <Reveal as="p" delay={0.2} className={styles.intro}>
            Each outreach is planned with local leaders, so help arrives where it is needed and keeps working after we
            leave.
          </Reveal>
        </div>

        <div className={styles.frame}>
          <ul className={styles.grid} data-rail-track="">
            {items.map((p, i) => (
              <li key={p.slug} className={styles.item}>
                <Link href={`/programmes/${p.slug}`} className={styles.card}>
                  <Reveal as="span" variant="unveil" delay={(i % 3) * 0.12} className={styles.media}>
                    <span className={styles.zoom}>
                      <span className={styles.drift} data-rail-img="">
                        <Picture
                          image={p.image}
                          sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
                          className={styles.photo}
                        />
                      </span>
                    </span>
                  </Reveal>
                  <Reveal as="span" delay={(i % 3) * 0.12 + 0.25} className={styles.body}>
                    <span className={styles.cardTitle}>{p.title}</span>
                    <span className={styles.summary}>{p.summary}</span>
                    <span className={styles.more}>
                      Learn more <Arrow className={styles.arrow} />
                    </span>
                  </Reveal>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.foot}>
          <ButtonLink href="/programmes" variant="ghost">
            All programmes
          </ButtonLink>
          <span className={styles.rail} aria-hidden="true">
            <span data-rail-bar="" />
          </span>
        </div>
      </div>
    </ProgrammesRail>
  );
}
