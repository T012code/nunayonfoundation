import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/page/PageHero";
import { Toc } from "@/components/page/Toc";
import type { Copy } from "@/content/copy";
import styles from "./LegalArticle.module.css";

const date = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

/** Privacy, terms and cookies: a sticky contents list beside readable, sectioned text. */
/** Paragraphs are separated by blank lines; a block whose lines all start with "- " is a list. */
function blocks(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const lines = b.split("\n").map((l) => l.trim());
      return lines.every((l) => l.startsWith("- ")) ? lines.map((l) => l.slice(2)) : b;
    });
}

export function LegalArticle({ page }: { page: Copy<"privacy"> }) {
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} lead={page.lead}>
        <p className={styles.updated}>
          Last updated <time dateTime={page.updated}>{date(page.updated)}</time>
        </p>
      </PageHero>

      <div className={`wrap ${styles.layout}`}>
        <aside className={styles.aside}>
          <Toc items={page.sections.map((s) => ({ id: s.id, label: s.title }))} />
        </aside>
        <div className={styles.body}>
          {page.sections.map((s) => (
            <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
              <Reveal>
                <h2 id={`${s.id}-title`} className={styles.heading}>
                  {s.title}
                </h2>
                {blocks(s.body).map((block, i) =>
                  Array.isArray(block) ? (
                    <ul key={i} className={styles.list}>
                      {block.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{block}</p>
                  ),
                )}
              </Reveal>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
