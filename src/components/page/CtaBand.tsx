import { LeafField, type Leaf } from "@/components/motion/LeafField";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { getCopy } from "@/lib/copy";
import styles from "./CtaBand.module.css";

const LEAVES: Leaf[] = [
  { top: "-20%", left: "72%", size: "clamp(12rem, 24vw, 20rem)", speed: 0.25, rotate: -28, angle: 16, opacity: 0.12 },
  { top: "45%", left: "-5%", size: "clamp(7rem, 12vw, 10rem)", speed: 0.5, rotate: 40, angle: -24, opacity: 0.14, sway: 12 },
  { top: "70%", left: "56%", size: "clamp(3.5rem, 5vw, 5rem)", speed: 0.7, rotate: -80, angle: 30, opacity: 0.16, sway: 9 },
];

/** Closing call to action on inner pages. Empty title or body fall back to the site-wide text. */
export async function CtaBand({
  title,
  body,
  actions,
}: {
  title?: string;
  body?: string;
  /** Buttons in place of the default Donate and Volunteer. */
  actions?: ReactNode;
}) {
  const site = (await getCopy("site")).cta;
  title ||= site.title;
  body ||= site.body;
  return (
    <section className={styles.band} aria-labelledby="cta-title">
      <LeafField leaves={LEAVES} />
      <div className={`wrap ${styles.inner}`}>
        <h2 id="cta-title" className={styles.title} data-reveal="words">
          <Words text={title} />
        </h2>
        <Reveal as="p" delay={0.25} className={styles.body}>
          {body}
        </Reveal>
        <Reveal delay={0.35} className={styles.actions}>
          {actions ?? (
            <>
              <ButtonLink href="/donate" variant="cta">
                {site.donate}
              </ButtonLink>
              <ButtonLink href="/volunteer" variant="inverse">
                {site.volunteer}
              </ButtonLink>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
