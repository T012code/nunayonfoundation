import type { Metadata } from "next";
import { CtaBand } from "@/components/page/CtaBand";
import { Faq } from "@/components/page/Faq";
import { PageHero } from "@/components/page/PageHero";
import { Toc } from "@/components/page/Toc";
import { ButtonLink } from "@/components/ui/Button";
import { getSettings } from "@/lib/content";
import { getCopy } from "@/lib/copy";
import styles from "@/components/page/LegalArticle.module.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Nunayon Foundation: where we work, giving by bank transfer, volunteering at outreaches and partnering with us.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [faq, site] = await Promise.all([getCopy("faq"), getSettings()]);
  // Lets search engines show the answers directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.groups.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero {...faq.hero} />

      <div className={`wrap ${styles.layout}`}>
        <aside className={styles.aside}>
          <Toc label={faq.topics} items={faq.groups.map((g) => ({ id: g.id, label: g.title }))} />
        </aside>
        <div className={styles.body}>
          {faq.groups.map((g) => (
            <section key={g.id} id={g.id} className={styles.section} aria-labelledby={`${g.id}-title`}>
              <h2 id={`${g.id}-title`} className={styles.heading}>
                {g.title}
              </h2>
              <Faq items={g.items} />
            </section>
          ))}
        </div>
      </div>

      <CtaBand
        title={faq.cta.title}
        body={faq.cta.body}
        actions={
          <>
            <ButtonLink href="/contact" variant="cta">
              {faq.cta.button}
            </ButtonLink>
            <ButtonLink href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} variant="inverse">
              {faq.cta.whatsapp}
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
