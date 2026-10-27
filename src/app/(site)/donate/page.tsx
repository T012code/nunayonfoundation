import type { Metadata } from "next";
import { DonationForm } from "@/components/forms/DonationForm";
import { DonateBand } from "@/components/home/DonateBand";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "@/components/page/Faq";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { donate } from "@/content/pages";
import { getProgrammes, getSettings } from "@/lib/content";
import b from "@/components/page/blocks.module.css";
import styles from "./donate.module.css";

export const metadata: Metadata = {
  title: "Donate",
  description: "Give to Nunayon Foundation by bank transfer and tell us you've given. Every gift reaches a child, a family or a community.",
  alternates: { canonical: "/donate" },
};

export default async function DonatePage() {
  const [settings, programmes] = await Promise.all([getSettings(), getProgrammes()]);
  return (
    <>
      <PageHero {...donate.hero} />

      <DonateBand accounts={settings.bankAccounts} />

      <section className={b.section} aria-labelledby="uses-title">
        <div className="wrap">
          <SectionHead
            id="uses-title"
            eyebrow="What your gift does"
            title="Every amount does something real"
            lead="These are typical costs from our recent outreaches."
          />
          <ul className={b.grid4}>
            {donate.uses.map((u, i) => (
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
            <SectionHead id="tell-title" eyebrow="Already given?" title="Tell us you've given" />
            <Reveal as="p" className={styles.note}>
              We&apos;ll match your transfer, send a receipt to your email and let you know where your gift went.
            </Reveal>
          </div>
          <Reveal className={b.formCard}>
            <DonationForm programmes={programmes.map((p) => p.title)} />
          </Reveal>
        </div>
      </section>

      <section className={b.section} aria-labelledby="faq-title">
        <div className={`wrap ${styles.faq}`}>
          <SectionHead id="faq-title" eyebrow="Questions" title="About giving" />
          <Faq items={donate.faqs} />
        </div>
      </section>
    </>
  );
}
