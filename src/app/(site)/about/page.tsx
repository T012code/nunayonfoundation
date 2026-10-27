import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { Story } from "@/components/home/Story";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { about } from "@/content/pages";
import { story } from "@/content/site";
import { Picture } from "@/components/ui/Picture";
import { getPeople, getSettings } from "@/lib/content";
import b from "@/components/page/blocks.module.css";

export const metadata: Metadata = {
  title: "About us",
  description: about.hero.lead,
  alternates: { canonical: "/about" },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export default async function AboutPage() {
  const [site, people] = await Promise.all([getSettings(), getPeople()]);
  return (
    <>
      <PageHero {...about.hero} />

      <Story {...story} hideLink />

      <section className={b.section} aria-labelledby="purpose-title">
        <div className="wrap">
          <SectionHead id="purpose-title" eyebrow="Why we exist" title="What we are working towards" />
          <div className={b.pair}>
            <Reveal className={b.statement}>
              <p className={b.statementLabel}>Our mission</p>
              <p className={b.statementText}>{about.mission}</p>
              <Logo variant="mark" className={`${b.statementMark} logo-reversed`} aria-hidden="true" />
            </Reveal>
            <Reveal delay={0.12} className={b.statement}>
              <p className={b.statementLabel}>Our vision</p>
              <p className={b.statementText}>{about.vision}</p>
              <Logo variant="mark" className={`${b.statementMark} logo-reversed`} aria-hidden="true" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`${b.section} ${b.sand}`} aria-labelledby="values-title">
        <div className="wrap">
          <SectionHead
            id="values-title"
            eyebrow="Our values"
            title="Four things that shape every outreach"
            lead="They guide who we work with, how we spend every gift, and how we treat the families we meet."
          />
          <ul className={b.grid4}>
            {about.values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.08}>
                <div className={b.card}>
                  <Logo variant="mark" className={b.cardIcon} aria-hidden="true" />
                  <h3 className={b.cardTitle}>{v.title}</h3>
                  <p className={b.cardBody}>{v.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className={b.section} aria-labelledby="people-title">
        <div className="wrap">
          <SectionHead
            id="people-title"
            eyebrow="Our people"
            title="Founder, trustees and team"
            lead="A small team in Lagos, a board of trustees who hold us to account, and hundreds of volunteers across the country."
          />
          <ul className={b.grid3}>
            {people.map((p, i) => (
              <Reveal as="li" key={i} variant="pop" delay={(i % 3) * 0.08}>
                <div className={b.person}>
                  <span className={b.avatar} aria-hidden="true">
                    {p.image ? <Picture image={p.image} sizes="(min-width: 64rem) 25vw, 46vw" className={b.avatarPhoto} alt="" /> : initials(p.name)}
                  </span>
                  <span className={b.personName}>{p.name}</span>
                  <span className={b.personRole}>{p.role}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${b.section} ${b.ruled}`} aria-labelledby="where-title">
        <div className="wrap">
          <SectionHead
            id="where-title"
            eyebrow="Where we work"
            title="Based in Lagos, reaching communities across Nigeria"
          />
          <div className={b.where}>
            <Reveal className={b.office}>
              <p className={b.statementLabel}>Our office</p>
              <p>{site.address}</p>
              <p>Visits by appointment. Call or WhatsApp {site.phone}.</p>
            </Reveal>
            <ul className={b.states} aria-label="States we have held outreaches in">
              {about.states.map((s, i) => (
                <Reveal as="li" variant="up" key={s} delay={i * 0.04}>
                  {s}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
