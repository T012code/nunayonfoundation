import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import type { ImageRef } from "@/content/images";
import styles from "./Story.module.css";

type Props = {
  eyebrow: string;
  title: string;
  values: string[];
  chapters: { title: string; body: string }[];
  image: ImageRef;
  quote: { text: string; name: string; role: string };
  /** The link to the About page. */
  button?: string;
  /** Hide the "About us" link (on the About page itself). */
  hideLink?: boolean;
};

export function Story({ eyebrow, title, values, chapters, image, quote, button = "About us", hideLink }: Props) {
  return (
    <section className={styles.section} aria-labelledby="story-title">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.aside}>
          <div className={styles.sticky}>
            <Reveal as="p" className="eyebrow">
              {eyebrow}
            </Reveal>
            <h2 id="story-title" className={styles.title} data-reveal="words">
              <Words text={title} />
            </h2>
            <ul className={styles.values} aria-label="Our values">
              {values.map((v, i) => (
                <Reveal as="li" variant="up" key={v} delay={0.35 + i * 0.08}>
                  <Logo variant="mark" className={styles.valueMark} aria-hidden="true" />
                  {v}
                </Reveal>
              ))}
            </ul>
            {hideLink ? null : (
              <Reveal delay={0.6}>
                <ButtonLink href="/about" variant="ghost">
                  {button}
                </ButtonLink>
              </Reveal>
            )}
          </div>
        </div>

        <div className={styles.main}>
          <Reveal variant="unveil" className={styles.photoWrap}>
            <div className={styles.parallax} data-parallax="0.12">
              <Picture image={image} sizes="(min-width: 64rem) 50vw, 92vw" className={styles.photo} />
            </div>
          </Reveal>

          <ol className={styles.chapters}>
            {chapters.map((c, i) => (
              <li key={c.title} className={styles.chapter}>
                <Reveal as="span" variant="draw" delay={i * 0.06} className={styles.rule} />
                <Reveal delay={0.1 + i * 0.06}>
                  <h3 className={styles.chapterTitle}>{c.title}</h3>
                  <p>{c.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal as="figure" className={styles.quote}>
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
