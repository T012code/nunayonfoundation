import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
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
          <Reveal>
            <p className="eyebrow">News &amp; stories</p>
            <h2 id="stories-title" className={styles.title}>
              From our recent outreaches
            </h2>
          </Reveal>
          <ButtonLink href="/news" variant="ghost">
            All stories
          </ButtonLink>
        </div>

        <div className={styles.layout}>
          <Reveal as="article" className={styles.lead}>
            <Link href={`/news/${lead.slug}`} className={styles.card}>
              <span className={styles.media}>
                <Picture slug={lead.image} sizes="(min-width: 64rem) 55vw, 92vw" className={styles.photo} />
              </span>
              <span className={styles.leadTitle}>{lead.title}</span>
              <span className={styles.excerpt}>{lead.excerpt}</span>
            </Link>
          </Reveal>
          <div className={styles.side}>
            {rest.map((a, i) => (
              <Reveal as="article" key={a.slug} delay={0.08 * (i + 1)}>
                <Link href={`/news/${a.slug}`} className={`${styles.card} ${styles.row}`}>
                  <span className={styles.thumb}>
                    <Picture slug={a.image} sizes="(min-width: 64rem) 16vw, 36vw" className={styles.photo} />
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
