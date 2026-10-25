import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./Ways.module.css";

type Item = { title: string; body: string; href: string; cta: string; image: ImageSlug };

export function Ways({ eyebrow, title, items }: { eyebrow: string; title: string; items: Item[] }) {
  return (
    <section className={styles.section} aria-labelledby="ways-title">
      <div className="wrap">
        <Reveal className={styles.head}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="ways-title" className={styles.title}>
            {title}
          </h2>
        </Reveal>
        <ul className={styles.list}>
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.08}>
              <Link href={item.href} className={styles.card}>
                <Picture slug={item.image} sizes="(min-width: 56rem) 30vw, 92vw" className={styles.photo} alt="" />
                <span className={styles.shade} aria-hidden="true" />
                <span className={styles.body}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.text}>{item.body}</span>
                  <span className={styles.cta}>
                    {item.cta} <Arrow className={styles.arrow} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
