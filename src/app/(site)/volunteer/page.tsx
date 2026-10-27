import type { Metadata } from "next";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "@/components/page/Faq";
import { GrowingSteps } from "@/components/page/GrowingSteps";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import b from "@/components/page/blocks.module.css";
import styles from "./volunteer.module.css";
import { getCopy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Volunteer with Nunayon Foundation: teaching, health, logistics and media roles at outreaches across Nigeria.",
  alternates: { canonical: "/volunteer" },
};

export default async function VolunteerPage() {
  const c = await getCopy("volunteer");
  return (
    <>
      <PageHero {...c.hero}>
        <ButtonLink href="#sign-up" variant="cta">
          {c.hero.button}
        </ButtonLink>
      </PageHero>

      <section className={`${b.section} ${b.sand}`} aria-labelledby="roles-title">
        <div className="wrap">
          <SectionHead
            id="roles-title"
            eyebrow={c.roles.eyebrow}
            title={c.roles.title}
            lead={c.roles.lead}
          />
          <ul className={b.grid4}>
            {c.roles.items.map((r, i) => (
              <Reveal as="li" key={r.title} delay={i * 0.08}>
                <div className={styles.role}>
                  <Reveal as="span" variant="unveil" delay={i * 0.08} className={styles.roleMedia}>
                    <Picture image={r.image} sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 92vw" className={styles.photo} />
                  </Reveal>
                  <h3 className={b.cardTitle}>{r.title}</h3>
                  <p className={b.cardBody}>{r.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className={b.section} aria-labelledby="how-title">
        <div className="wrap">
          <SectionHead id="how-title" eyebrow={c.how.eyebrow} title={c.how.title} />
          <GrowingSteps steps={c.how.steps} />
        </div>
      </section>

      <section id="sign-up" className={`${b.section} ${b.sand} ${styles.anchor}`} aria-labelledby="signup-title">
        <div className={`wrap ${b.split}`}>
          <div className={b.stickyAside}>
            <SectionHead id="signup-title" eyebrow={c.signup.eyebrow} title={c.signup.title} />
            <Reveal as="p" className={styles.note}>
              {c.signup.note}
            </Reveal>
          </div>
          <Reveal className={b.formCard}>
            <VolunteerForm />
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
