import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { Arrow } from "@/components/ui/Arrow";
import { Check } from "@/components/ui/Check";
import { Picture } from "@/components/ui/Picture";
import { getProgrammes } from "@/lib/content";
import b from "@/components/page/blocks.module.css";
import styles from "./programmes.module.css";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Education support, women's livelihoods, youth skills, community health, food relief and clean water: the programmes of Nunayon Foundation.",
  alternates: { canonical: "/programmes" },
};

export default async function ProgrammesPage() {
  const programmes = await getProgrammes();
  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Every programme, one aim: families who can stand on their own."
        lead="Every outreach is planned with local leaders and followed up after the day. Choose a programme to see what it covers and how it works."
      >
        <ul className={styles.jump} aria-label="Jump to a programme">
          {programmes.map((p) => (
            <li key={p.slug}>
              <a href={`#${p.slug}`}>
                {p.title}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      <div className={styles.list}>
        {programmes.map((p, i) => (
          <section key={p.slug} id={p.slug} className={styles.row} aria-labelledby={`${p.slug}-title`}>
            <div className={`wrap ${styles.rowInner}`} data-flip={i % 2 ? "" : undefined}>
              <Reveal variant="unveil" className={styles.media}>
                <div className={styles.parallax} data-parallax="0.1">
                  <Picture image={p.image} sizes="(min-width: 64rem) 46vw, 92vw" className={styles.photo} />
                </div>
              </Reveal>
              <div className={styles.copy}>
                <h2 id={`${p.slug}-title`} className={styles.title} data-reveal="words">
                  <Words text={p.title} />
                </h2>
                <Reveal as="p" delay={0.15} className={styles.intro}>
                  {p.intro}
                </Reveal>
                <ul className={b.checks}>
                  {p.covers.map((c, k) => (
                    <Reveal as="li" key={c} delay={0.2 + k * 0.06}>
                      <Check />
                      <span>{c}</span>
                    </Reveal>
                  ))}
                </ul>
                <Reveal delay={0.4} className={styles.foot}>
                  <span className={styles.stat}>
                    <strong>{p.stat.value}</strong> {p.stat.label}
                  </span>
                  <Link href={`/programmes/${p.slug}`} className={styles.more}>
                    About this programme <Arrow className={styles.arrow} />
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>
        ))}
      </div>

      <CtaBand title="Help us reach the next family." />
    </>
  );
}
