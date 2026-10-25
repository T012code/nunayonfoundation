import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { CtaBand } from "@/components/page/CtaBand";
import { SectionHead } from "@/components/page/SectionHead";
import { Picture } from "@/components/ui/Picture";
import { articles, programmes } from "@/content/site";
import { SITE_URL } from "@/lib/env";
import { ShareLinks } from "./ShareLinks";
import styles from "./article.module.css";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/news/${a.slug}` },
    openGraph: { type: "article", images: [{ url: `/placeholder/${a.image}-1600.webp`, width: 1600, alt: a.title }] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  const programme = programmes.find((p) => p.slug === a.programme);
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const [first, ...body] = a.body;

  return (
    <>
      <article className={styles.article}>
        <header className={`wrap ${styles.head}`}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link href="/news">News</Link>
            {programme ? (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/programmes/${programme.slug}`}>{programme.title}</Link>
              </>
            ) : null}
          </nav>
          <h1 className={styles.title}>
            <Words text={a.title} />
          </h1>
          <p className={styles.standfirst}>{a.excerpt}</p>
        </header>

        <div className={`wrap ${styles.heroWrap}`}>
          <div className={styles.hero}>
            <Picture slug={a.image} sizes="(min-width: 80rem) 76rem, 96vw" priority className={styles.heroPhoto} />
            <span className={styles.cover} aria-hidden="true" />
          </div>
        </div>

        <div className={`wrap ${styles.body}`}>
          <Reveal as="p" className={styles.first}>
            {first}
          </Reveal>
          {body.map((para, i) => (
            <Reveal as="p" key={i}>
              {para}
            </Reveal>
          ))}
          {a.photos?.length ? (
            <div className={styles.photos}>
              {a.photos.map((p, i) => (
                <Reveal key={p} variant="unveil" delay={i * 0.12} className={styles.inline}>
                  <Picture slug={p} sizes="(min-width: 48rem) 24rem, 46vw" className={styles.inlinePhoto} />
                </Reveal>
              ))}
            </div>
          ) : null}
          <ShareLinks url={`${SITE_URL}/news/${a.slug}`} title={a.title} />
        </div>
      </article>

      <section className={styles.more} aria-labelledby="more-title">
        <div className="wrap">
          <SectionHead id="more-title" eyebrow="Keep reading" title="More stories" />
          <ul className={styles.moreGrid}>
            {more.map((m, i) => (
              <Reveal as="li" key={m.slug} delay={i * 0.1}>
                <Link href={`/news/${m.slug}`} className={styles.moreCard}>
                  <span className={styles.moreMedia}>
                    <Picture slug={m.image} sizes="(min-width: 64rem) 30vw, 92vw" className={styles.inlinePhoto} />
                  </span>
                  <span className={styles.moreTitle}>{m.title}</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
