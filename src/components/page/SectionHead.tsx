import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import styles from "./SectionHead.module.css";

/** Eyebrow, a heading that rises word by word, an optional lead and an optional action. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  action,
  id,
  tone = "light",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  as?: "h2" | "h3";
}) {
  return (
    <div className={styles.head} data-tone={tone}>
      <div>
        {eyebrow ? (
          <Reveal as="p" className={styles.eyebrow}>
            {eyebrow}
          </Reveal>
        ) : null}
        <Heading id={id} className={styles.title} data-reveal="words">
          <Words text={title} />
        </Heading>
      </div>
      {lead || action ? (
        <Reveal delay={0.2} className={styles.side}>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
