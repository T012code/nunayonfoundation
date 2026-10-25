import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./Story.module.css";

type Props = {
  eyebrow: string;
  title: string;
  values: string[];
  chapters: { title: string; body: string }[];
  image: ImageSlug;
  quote: { text: string; name: string; role: string };
};

export function Story({ eyebrow, title, values, chapters, image, quote }: Props) {
  return (
    <section className={styles.section} aria-labelledby="story-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.aside}>
          <div className={styles.sticky}>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="story-title" className={styles.title}>
              {title}
            </h2>
            <ul className={styles.values} aria-label="Our values">
              {values.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <ButtonLink href="/about" variant="ghost">
              About us
            </ButtonLink>
          </div>
        </div>

        <div className={styles.main}>
          <Reveal className={styles.photoWrap}>
            <Picture slug={image} sizes="(min-width: 64rem) 50vw, 92vw" className={styles.photo} />
          </Reveal>

          <ol className={styles.chapters}>
            {chapters.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 0.06} className={styles.chapter}>
                <h3 className={styles.chapterTitle}>{c.title}</h3>
                <p>{c.body}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <figure className={styles.quote}>
              <blockquote>
                <p>{quote.text}</p>
              </blockquote>
              <figcaption>
                <span className={styles.avatar} aria-hidden="true">
                  {quote.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span>
                  <strong>{quote.name}</strong>
                  <span className={styles.role}>{quote.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
