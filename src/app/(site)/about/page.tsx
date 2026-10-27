import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { Story } from "@/components/home/Story";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { SectionHead } from "@/components/page/SectionHead";
import { Picture } from "@/components/ui/Picture";
import { getPeople, getSettings } from "@/lib/content";
import { fill, getCopy } from "@/lib/copy";
import b from "@/components/page/blocks.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCopy("about");
  return { title: "About us", description: c.hero.lead, alternates: { canonical: "/about" } };
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export default async function AboutPage() {
  const [site, people, c, home] = await Promise.all([getSettings(), getPeople(), getCopy("about"), getCopy("home")]);
  return (
    <>
      <PageHero {...c.hero} />

      <Story {...home.story} hideLink />

      <section className={b.section} aria-labelledby="purpose-title">
        <div className="wrap">
          <SectionHead id="purpose-title" eyebrow={c.purpose.eyebrow} title={c.purpose.title} />
          <div className={b.pair}>
            <Reveal className={b.statement}>
              <p className={b.statementLabel}>{c.purpose.missionLabel}</p>
              <p className={b.statementText}>{c.purpose.mission}</p>
              <Logo variant="mark" className={`${b.statementMark} logo-reversed`} aria-hidden="true" />
            </Reveal>
            <Reveal delay={0.12} className={b.statement}>
              <p className={b.statementLabel}>{c.purpose.visionLabel}</p>
              <p className={b.statementText}>{c.purpose.vision}</p>
              <Logo variant="mark" className={`${b.statementMark} logo-reversed`} aria-hidden="true" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`${b.section} ${b.sand}`} aria-labelledby="values-title">
        <div className="wrap">
          <SectionHead
            id="values-title"
            eyebrow={c.values.eyebrow}
            title={c.values.title}
            lead={c.values.lead}
          />
          <ul className={b.grid4}>
            {c.values.items.map((v, i) => (
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
            eyebrow={c.people.eyebrow}
            title={c.people.title}
            lead={c.people.lead}
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
            eyebrow={c.where.eyebrow}
            title={c.where.title}
          />
          <div className={b.where}>
            <Reveal className={b.office}>
              <p className={b.statementLabel}>{c.where.officeLabel}</p>
              <p>{site.address}</p>
              <p>{fill(c.where.officeNote, { phone: site.phone })}</p>
            </Reveal>
            <ul className={b.states} aria-label="States we have held outreaches in">
              {c.where.states.map((s, i) => (
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
