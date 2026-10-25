import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import styles from "./DonateBand.module.css";

type Account = { currency: string; bank: string; name: string; number: string };

export function DonateBand({ accounts }: { accounts: Account[] }) {
  return (
    <section className={styles.section} aria-labelledby="donate-title">
      <div className={`wrap ${styles.inner}`}>
        <Reveal className={styles.copy}>
          <p className={styles.eyebrow}>Give by bank transfer</p>
          <h2 id="donate-title" className={styles.title}>
            Every naira reaches a child, a family or a community.
          </h2>
          <p className={styles.lead}>
            Transfer any amount to the account below, then let us know so we can thank you and tell you where it went.
          </p>
          <ButtonLink href="/donate#tell-us" variant="cta" className={styles.cta}>
            I&apos;ve made a donation
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.1} className={styles.cards}>
          {accounts.map((a) => (
            <dl key={a.number} className={styles.card}>
              <div className={styles.row}>
                <dt>Bank</dt>
                <dd>{a.bank}</dd>
              </div>
              <div className={styles.row}>
                <dt>Account name</dt>
                <dd>{a.name}</dd>
              </div>
              <div className={`${styles.row} ${styles.numberRow}`}>
                <dt>Account number ({a.currency})</dt>
                <dd>
                  <span className={styles.number}>{a.number}</span>
                  <CopyButton value={a.number} label="account number" />
                </dd>
              </div>
            </dl>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
