import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { Arrow } from "@/components/ui/Arrow";
import { Picture } from "@/components/ui/Picture";
import { articles, programmes } from "@/content/site";
import b from "@/components/page/blocks.module.css";
import styles from "./news.module.css";

export const metadata: Metadata = {
  title: "News & stories",
  description: "Stories from Nunayon Foundation outreaches across Nigeria.",
  alternates: { canonical: "/news" },
};

const programmeTitle = (slug: string) => programmes.find((p) => p.slug === slug)?.title ?? "";

export default function NewsPage() {
  const [lead, ...rest] = articles;
  return (
    <>
      <PageHero
        eyebrow="News"
        title="Stories from the field."
        lead="What happened at our outreaches, who we met, and what your support made possible."
      />

      <section className={b.section} style={{ paddingTop: 0 }} aria-label="Stories">
        <div className="wrap">
          <Reveal as="article">
            <Link href={`/news/${lead.slug}`} className={styles.feature}>
              <Reveal as="span" variant="unveil" className={styles.featureMedia}>
                <span className={styles.zoom}>
                  <Picture slug={lead.image} sizes="(min-width: 64rem) 58vw, 92vw" priority className={styles.photo} />
                </span>
              </Reveal>
              <span className={styles.featureText}>
                <span className={styles.tag}>{programmeTitle(lead.programme)}</span>
                <span className={styles.featureTitle}>{lead.title}</span>
                <span className={styles.excerpt}>{lead.excerpt}</span>
                <span className={styles.read}>
                  Read the story <Arrow className={styles.arrow} />
                </span>
              </span>
            </Link>
          </Reveal>

          <ul className={styles.grid}>
            {rest.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 0.1}>
                <article>
                  <Link href={`/news/${a.slug}`} className={styles.card}>
                    <span className={styles.cardMedia}>
                      <span className={styles.zoom}>
                        <Picture slug={a.image} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw" className={styles.photo} />
                      </span>
                    </span>
                    <span className={styles.tag}>{programmeTitle(a.programme)}</span>
                    <span className={styles.cardTitle}>{a.title}</span>
                    <span className={styles.excerpt}>{a.excerpt}</span>
                  </Link>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
