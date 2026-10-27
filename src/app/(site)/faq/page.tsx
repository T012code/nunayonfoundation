import type { Metadata } from "next";
import { CtaBand } from "@/components/page/CtaBand";
import { Faq } from "@/components/page/Faq";
import { PageHero } from "@/components/page/PageHero";
import { Toc } from "@/components/page/Toc";
import { ButtonLink } from "@/components/ui/Button";
import { faq } from "@/content/pages";
import { site } from "@/content/site";
import styles from "@/components/page/LegalArticle.module.css";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Nunayon Foundation: where we work, giving by bank transfer, volunteering at outreaches and partnering with us.",
  alternates: { canonical: "/faq" },
};

// Lets search engines show the answers directly in results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.groups.flatMap((g) =>
    g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  ),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero {...faq.hero} />

      <div className={`wrap ${styles.layout}`}>
        <aside className={styles.aside}>
          <Toc label="Topics" items={faq.groups.map((g) => ({ id: g.id, label: g.title }))} />
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
        title="Still have a question?"
        body="Send us a message and we'll reply within two working days. For something quick, WhatsApp is fastest."
        actions={
          <>
            <ButtonLink href="/contact" variant="cta">
              Send a message
            </ButtonLink>
            <ButtonLink href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} variant="inverse">
              WhatsApp us
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
