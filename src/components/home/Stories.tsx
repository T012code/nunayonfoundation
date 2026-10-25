import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { Article } from "@/content/site";
import styles from "./Stories.module.css";

export function Stories({ items }: { items: Article[] }) {
  const [lead, ...rest] = items;
  return (
    <section className={styles.section} aria-labelledby="stories-title">
      <div className="wrap">
        <div className={styles.head}>
          <div>
            <Reveal as="p" className="eyebrow">
              News &amp; stories
            </Reveal>
            <h2 id="stories-title" className={styles.title} data-reveal="words">
              <Words text="From our recent outreaches" />
            </h2>
          </div>
          <Reveal delay={0.2}>
            <ButtonLink href="/news" variant="ghost">
              All stories
            </ButtonLink>
          </Reveal>
        </div>

        <div className={styles.layout}>
          <article className={styles.lead}>
            <Link href={`/news/${lead.slug}`} className={styles.card}>
              <Reveal as="span" variant="unveil" className={styles.media}>
                <span className={styles.zoom}>
                  <Picture slug={lead.image} sizes="(min-width: 64rem) 55vw, 92vw" className={styles.photo} />
                </span>
              </Reveal>
              <Reveal as="span" delay={0.2} className={styles.leadText}>
                <span className={styles.leadTitle}>{lead.title}</span>
                <span className={styles.excerpt}>{lead.excerpt}</span>
              </Reveal>
            </Link>
          </article>
          <div className={styles.side}>
            {rest.map((a, i) => (
              <Reveal as="article" key={a.slug} delay={0.15 * (i + 1)}>
                <Link href={`/news/${a.slug}`} className={`${styles.card} ${styles.row}`}>
                  <span className={styles.thumb}>
                    <span className={styles.zoom}>
                      <Picture slug={a.image} sizes="(min-width: 64rem) 16vw, 36vw" className={styles.photo} />
                    </span>
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{a.title}</span>
                    <span className={styles.excerpt}>{a.excerpt}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
