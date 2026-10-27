import type { Metadata } from "next";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { Reveal } from "@/components/motion/Reveal";
import { Faq } from "@/components/page/Faq";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { volunteer } from "@/content/pages";
import b from "@/components/page/blocks.module.css";
import styles from "./volunteer.module.css";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Volunteer with Nunayon Foundation: teaching, health, logistics and media roles at outreaches across Nigeria.",
  alternates: { canonical: "/volunteer" },
};

export default function VolunteerPage() {
  return (
    <>
      <PageHero {...volunteer.hero}>
        <ButtonLink href="#sign-up" variant="cta">
          Sign up to volunteer
        </ButtonLink>
      </PageHero>

      <section className={`${b.section} ${b.sand}`} aria-labelledby="roles-title">
        <div className="wrap">
          <SectionHead
            id="roles-title"
            eyebrow="Ways to help"
            title="Bring what you're good at"
            lead="Every outreach needs a mix of people. Choose one role or a few; we'll match you to where you're needed."
          />
          <ul className={b.grid4}>
            {volunteer.roles.map((r, i) => (
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
          <SectionHead id="how-title" eyebrow="How it works" title="Three steps to your first outreach" />
          <ol className={b.steps}>
            {volunteer.steps.map((s, i) => (
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

      <section id="sign-up" className={`${b.section} ${b.sand} ${styles.anchor}`} aria-labelledby="signup-title">
        <div className={`wrap ${b.split}`}>
          <div className={b.stickyAside}>
            <SectionHead id="signup-title" eyebrow="Sign up" title="Join the volunteer team" />
            <Reveal as="p" className={styles.note}>
              It takes about two minutes. We&apos;ll call you within a week to say hello and talk about the next outreach.
            </Reveal>
          </div>
          <Reveal className={b.formCard}>
            <VolunteerForm />
          </Reveal>
        </div>
      </section>

      <section className={b.section} aria-labelledby="faq-title">
        <div className={`wrap ${styles.faq}`}>
          <SectionHead id="faq-title" eyebrow="Questions" title="Before you sign up" />
          <Faq items={volunteer.faqs} />
        </div>
      </section>
    </>
  );
}
