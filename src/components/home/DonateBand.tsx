import { LeafField, type Leaf } from "@/components/motion/LeafField";
import { Reveal } from "@/components/motion/Reveal";
import { Words } from "@/components/motion/Words";
import { ButtonLink } from "@/components/ui/Button";
import type { BankAccount } from "@/content/bank";
import { COPY, type Copy } from "@/content/copy";
import { BankAccounts } from "./BankAccounts";
import styles from "./DonateBand.module.css";


const LEAVES: Leaf[] = [
  { top: "-8%", left: "-6%", size: "clamp(14rem, 30vw, 26rem)", speed: 0.18, rotate: 18, angle: -12, opacity: 0.13 },
  { top: "55%", left: "38%", size: "clamp(6rem, 11vw, 10rem)", speed: 0.42, rotate: -40, angle: 24, opacity: 0.15, sway: 12 },
  { top: "8%", left: "84%", size: "clamp(8rem, 15vw, 13rem)", speed: 0.3, rotate: 32, angle: -30, opacity: 0.12, sway: 18 },
  { top: "78%", left: "88%", size: "clamp(4rem, 7vw, 6rem)", speed: 0.6, rotate: -60, angle: 40, opacity: 0.16, sway: 10 },
];

export function DonateBand({ accounts, copy = COPY.home.donate }: { accounts: BankAccount[]; copy?: Copy<"home">["donate"] }) {
  return (
    <section className={styles.section} aria-labelledby="donate-title">
      <LeafField leaves={LEAVES} />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <Reveal as="p" className={styles.eyebrow}>
            {copy.eyebrow}
          </Reveal>
          <h2 id="donate-title" className={styles.title} data-reveal="words">
            <Words text={copy.title} />
          </h2>
          <Reveal as="p" delay={0.3} className={styles.lead}>
            {copy.lead}
          </Reveal>
          <Reveal delay={0.45}>
            <ButtonLink href="/donate#tell-us" variant="cta" className={styles.cta}>
              {copy.button}
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.25} className={styles.cards}>
          <BankAccounts accounts={accounts} copy={copy} />
        </Reveal>
      </div>
    </section>
  );
}
