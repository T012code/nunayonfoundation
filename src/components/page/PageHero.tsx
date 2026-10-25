import Link from "next/link";
import { Words } from "@/components/motion/Words";
import { Picture } from "@/components/ui/Picture";
import type { ImageSlug } from "@/content/images";
import styles from "./PageHero.module.css";

type Crumb = { href: string; label: string };

/**
 * Header for inner pages: breadcrumb, eyebrow, a headline that rises word by word on load,
 * a lead, and an optional photo that a paper cover slides off. CSS-only, so it plays before
 * the page is interactive.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  crumbs = [],
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image?: ImageSlug;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className={styles.hero} data-has-image={image ? "" : undefined}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>{c.label}</Link>
                </li>
              ))}
              <li aria-current="page">{eyebrow}</li>
            </ol>
          </nav>
          <h1 className={styles.title}>
            <Words text={title} />
          </h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          {children ? <div className={styles.extra}>{children}</div> : null}
        </div>
        {image ? (
          <div className={styles.media}>
            <Picture slug={image} sizes="(min-width: 64rem) 45vw, 92vw" priority className={styles.photo} />
            <span className={styles.cover} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
