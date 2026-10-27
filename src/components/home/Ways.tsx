import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { Arrow } from "@/components/ui/Arrow";
import { Picture } from "@/components/ui/Picture";
import type { ImageRef } from "@/content/images";
import styles from "./Ways.module.css";

type Item = { title: string; body: string; href: string; cta: string; image: ImageRef };

export function Ways({ eyebrow, title, items }: { eyebrow: string; title: string; items: Item[] }) {
  return (
    <section className={styles.section} aria-labelledby="ways-title">
      <div className="wrap">
        <div className={styles.head}>
          <Reveal as="p" className="eyebrow">
            {eyebrow}
          </Reveal>
          <h2 id="ways-title" className={styles.title} data-reveal="words">
            <Words text={title} />
          </h2>
        </div>
        <ul className={styles.list}>
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.12}>
              <Link href={item.href} className={styles.card}>
                <span className={styles.photoWrap} data-parallax="0.1">
                  <Picture image={item.image} sizes="(min-width: 56rem) 30vw, 92vw" className={styles.photo} alt="" />
                </span>
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
