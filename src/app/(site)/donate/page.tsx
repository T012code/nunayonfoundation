import type { Metadata } from "next";
import { DonationForm } from "@/components/forms/DonationForm";
import { DonateBand } from "@/components/home/DonateBand";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "@/components/page/Faq";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { getProgrammes, getSettings } from "@/lib/content";
import b from "@/components/page/blocks.module.css";
import styles from "./donate.module.css";
import { getCopy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Donate",
  description: "Give to Nunayon Foundation by bank transfer and tell us you've given. Every gift reaches a child, a family or a community.",
  alternates: { canonical: "/donate" },
};

export default async function DonatePage() {
  const [settings, programmes, c, home] = await Promise.all([getSettings(), getProgrammes(), getCopy("donate"), getCopy("home")]);
  return (
    <>
      <PageHero {...c.hero} />

      <DonateBand accounts={settings.bankAccounts} copy={home.donate} />

      <section className={b.section} aria-labelledby="uses-title">
        <div className="wrap">
          <SectionHead
            id="uses-title"
            eyebrow={c.uses.eyebrow}
            title={c.uses.title}
            lead={c.uses.lead}
          />
          <ul className={b.grid4}>
            {c.uses.items.map((u, i) => (
              <Reveal as="li" key={u.value} delay={i * 0.08}>
                <div className={`${b.card} ${styles.use}`}>
                  <span className={styles.value}>{u.value}</span>
                  <p className={b.cardBody}>{u.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="tell-us" className={`${b.section} ${b.sand} ${styles.anchor}`} aria-labelledby="tell-title">
        <div className={`wrap ${b.split}`}>
          <div className={b.stickyAside}>
            <SectionHead id="tell-title" eyebrow={c.tell.eyebrow} title={c.tell.title} />
            <Reveal as="p" className={styles.note}>
              {c.tell.note}
            </Reveal>
          </div>
          <Reveal className={b.formCard}>
            <DonationForm programmes={programmes.map((p) => p.title)} />
          </Reveal>
        </div>
      </section>

      <section className={b.section} aria-labelledby="faq-title">
        <div className={`wrap ${styles.faq}`}>
          <SectionHead id="faq-title" eyebrow={c.faq.eyebrow} title={c.faq.title} />
          <Faq items={c.faq.items} />
        </div>
      </section>
    </>
  );
}
