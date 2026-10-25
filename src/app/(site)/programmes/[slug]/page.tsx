import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { Arrow } from "@/components/ui/Arrow";
import { Check } from "@/components/ui/Check";
import { Picture } from "@/components/ui/Picture";
import { articles, programmes } from "@/content/site";
import b from "@/components/page/blocks.module.css";
import styles from "./programme.module.css";

export function generateStaticParams() {
  return programmes.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = programmes.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/programmes/${p.slug}` },
    openGraph: { images: [{ url: `/placeholder/${p.image}-1600.webp`, width: 1600, alt: p.title }] },
  };
}

// "2,400+" -> 2400 and "+" so the figure can count up.
function parseStat(value: string) {
  const m = value.match(/^([\d,]+)(.*)$/);
  return m ? { n: Number(m[1].replace(/,/g, "")), suffix: m[2] } : null;
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
            <SectionHead id="covers-title" eyebrow="What it covers" title="Where your support goes" />
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
          <SectionHead id="how-title" eyebrow="How it works" title="From the first visit to the follow-up" />
          <ol className={b.steps}>
            {p.steps.map((s, i) => (
              <li key={s.title} className={b.step}>
                <Reveal as="span" variant="draw" delay={i * 0.1} className={b.stepRule} />
                <Reveal delay={0.1 + i * 0.1}>
                  <h3 className={b.stepTitle}>{s.title}</h3>
                  <p className={b.stepBody}>{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${b.section} ${b.ruled}`} aria-labelledby="photos-title">
        <div className="wrap">
          <SectionHead
            id="photos-title"
            eyebrow="In pictures"
            title="From our outreaches"
            action={
              <Link href="/gallery" className={styles.link}>
                Open the gallery <Arrow />
              </Link>
            }
          />
          <ul className={styles.photos}>
            {p.photos.map((slug, i) => (
              <Reveal as="li" key={slug} variant="unveil" delay={(i % 3) * 0.1} className={styles.photoItem}>
                <Picture slug={slug} sizes="(min-width: 64rem) 30vw, 46vw" className={styles.photo} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {stories.length ? (
        <section className={`${b.section} ${b.sand}`} aria-labelledby="stories-title">
          <div className="wrap">
            <SectionHead id="stories-title" eyebrow="Stories" title="Recent news from this programme" />
            <ul className={b.grid2}>
              {stories.map((a, i) => (
                <Reveal as="li" key={a.slug} delay={i * 0.1}>
                  <Link href={`/news/${a.slug}`} className={styles.story}>
                    <span className={styles.storyMedia}>
                      <Picture slug={a.image} sizes="(min-width: 40rem) 22vw, 36vw" className={styles.photo} />
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
          <SectionHead id="others-title" eyebrow="More programmes" title="See what else we do" />
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

      <CtaBand title={`Support ${p.title.toLowerCase()}.`} />
    </>
  );
}
