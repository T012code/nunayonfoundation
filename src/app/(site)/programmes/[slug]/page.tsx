import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/page/CtaBand";
import { GrowingSteps } from "@/components/page/GrowingSteps";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { Check } from "@/components/ui/Check";
import { Picture } from "@/components/ui/Picture";
import { imageKey, shareImage } from "@/content/images";
import { getArticles, getProgrammes } from "@/lib/content";
import { SITE_URL } from "@/lib/env";
import b from "@/components/page/blocks.module.css";
import styles from "./programme.module.css";
import { fill, getCopy } from "@/lib/copy";

export async function generateStaticParams() {
  return (await getProgrammes()).map((p) => ({ slug: p.slug }));
}

// Programmes added after the last build are rendered on first visit, then kept.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProgrammes()).find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/programmes/${p.slug}` },
    openGraph: { images: [{ url: shareImage(p.image, SITE_URL), alt: p.title }] },
  };
}

// "2,400+" -> 2400 and "+" so the figure can count up.
function parseStat(value: string) {
  const m = value.match(/^([\d,]+)(.*)$/);
  return m ? { n: Number(m[1].replace(/,/g, "")), suffix: m[2] } : null;
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [programmes, articles, c] = await Promise.all([getProgrammes(), getArticles(), getCopy("programme")]);
  const p = programmes.find((x) => x.slug === slug);
  if (!p) notFound();
  const stories = articles.filter((a) => a.programme === p.slug);
  const others = programmes.filter((x) => x.slug !== p.slug);
  const stat = parseStat(p.stat.value);

  return (
    <>
      <PageHero
        eyebrow={p.title}
        title={p.title}
        lead={p.intro}
        image={p.image}
        crumbs={[{ href: "/programmes", label: "Programmes" }]}
      />

      <section className={`${b.section} ${b.sand}`} aria-labelledby="covers-title">
        <div className={`wrap ${styles.covers}`}>
          <div>
            <SectionHead id="covers-title" eyebrow={c.covers.eyebrow} title={c.covers.title} />
            <ul className={b.checks}>
              {p.covers.map((c, i) => (
                <Reveal as="li" key={c} delay={i * 0.06}>
                  <Check />
                  <span>{c}</span>
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal variant="pop" className={styles.statCard}>
            <span className={styles.statValue}>
              {stat ? <CountUp value={stat.n} suffix={stat.suffix} /> : p.stat.value}
            </span>
            <span className={styles.statLabel}>{p.stat.label}</span>
          </Reveal>
        </div>
      </section>

      <section className={b.section} aria-labelledby="how-title">
        <div className="wrap">
          <SectionHead id="how-title" eyebrow={c.how.eyebrow} title={c.how.title} />
          <GrowingSteps steps={p.steps} />
        </div>
      </section>

      <section className={`${b.section} ${b.ruled}`} aria-labelledby="photos-title">
        <div className="wrap">
          <SectionHead
            id="photos-title"
            eyebrow={c.photos.eyebrow}
            title={c.photos.title}
            action={
              <Link href="/gallery" className={styles.link}>
                {c.photos.link} <Arrow />
              </Link>
            }
          />
          <ul className={styles.photos}>
            {p.photos.map((slug, i) => (
              <Reveal as="li" key={imageKey(slug)} variant="unveil" delay={(i % 3) * 0.1} className={styles.photoItem}>
                <Picture image={slug} sizes="(min-width: 64rem) 30vw, 46vw" className={styles.photo} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {stories.length ? (
        <section className={`${b.section} ${b.sand}`} aria-labelledby="stories-title">
          <div className="wrap">
            <SectionHead id="stories-title" eyebrow={c.stories.eyebrow} title={c.stories.title} />
            <ul className={b.grid2}>
              {stories.map((a, i) => (
                <Reveal as="li" key={a.slug} delay={i * 0.1}>
                  <Link href={`/news/${a.slug}`} className={styles.story}>
                    <span className={styles.storyMedia}>
                      <Picture image={a.image} sizes="(min-width: 40rem) 22vw, 36vw" className={styles.photo} />
                    </span>
                    <span>
                      <span className={styles.storyTitle}>{a.title}</span>
                      <span className={styles.storyText}>{a.excerpt}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className={`${b.section} ${b.ruled}`} aria-labelledby="others-title">
        <div className="wrap">
          <SectionHead id="others-title" eyebrow={c.others.eyebrow} title={c.others.title} />
          <ul className={styles.others}>
            {others.map((o, i) => (
              <Reveal as="li" key={o.slug} delay={i * 0.05}>
                <Link href={`/programmes/${o.slug}`} className={styles.other}>
                  <span>{o.title}</span>
                  <Arrow className={styles.otherArrow} />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={fill(c.cta.title, { programme: p.title.toLowerCase() })} body={c.cta.body} />
    </>
  );
}
