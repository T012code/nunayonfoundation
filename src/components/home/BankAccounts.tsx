"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { BANK_FIELDS, type BankAccount } from "@/content/bank";
import type { Copy } from "@/content/copy";
import styles from "./DonateBand.module.css";

/** IBANs read and copy more easily in groups of four. */
const show = (key: string, v: string) => (key === "iban" ? v.replace(/(.{4})/g, "$1 ").trim() : v);

/**
 * The donation accounts. One account shows as a single card; with several, a row of currency
 * tabs picks which card shows. Each card shows only the details that currency uses, in the
 * order senders type them, with copy buttons on the numbers and codes.
 */
export function BankAccounts({ accounts, copy }: { accounts: BankAccount[]; copy: Copy<"home">["donate"] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  if (!accounts.length) return null;
  const a = accounts[Math.min(active, accounts.length - 1)];
  // Tabs are named by currency, plus the bank when two accounts share a currency.
  const tabName = (x: BankAccount) =>
    accounts.filter((y) => y.currency === x.currency).length > 1 ? `${x.currency} · ${x.bank}` : x.currency;

  return (
    <div className={styles.accounts}>
      {accounts.length > 1 ? (
        <div className={styles.tabs} role="tablist" aria-label="Account currency">
          {accounts.map((x, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              className={styles.tab}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                const next = (active + d + accounts.length) % accounts.length;
                setActive(next);
                document.getElementById(`${id}-tab-${next}`)?.focus();
              }}
              tabIndex={i === active ? 0 : -1}
            >
              {tabName(x)}
            </button>
          ))}
        </div>
      ) : null}
      <dl key={active} className={styles.card} id={`${id}-panel`} role={accounts.length > 1 ? "tabpanel" : undefined} aria-labelledby={accounts.length > 1 ? `${id}-tab-${active}` : undefined}>
        <Rows account={a} copy={copy} />
      </dl>
    </div>
  );
}

function Rows({ account: a, copy }: { account: BankAccount; copy: Copy<"home">["donate"] }) {
  const fields = BANK_FIELDS[a.currency].filter((f) => a[f.key]);
  // The number senders need most: the account number, or the IBAN for euro accounts without one.
  const primary = a.number ? "number" : "iban";
  const label = (key: string, fallback: string) =>
    key === "bank" ? copy.bankLabel : key === "name" ? copy.nameLabel : key === "number" ? `${copy.numberLabel} (${a.currency})` : fallback;
  const main = fields.filter((f) => !f.group);
  const abroad = fields.filter((f) => f.group === "abroad");
  const correspondent = fields.filter((f) => f.group === "correspondent");
  const row = (f: (typeof fields)[number]) => {
    const value = show(f.key, a[f.key]!);
    const big = f.key === primary;
    return (
      <div key={f.key} className={`${styles.row} ${f.copy ? styles.numberRow : ""}`}>
        <dt>{label(f.key, f.label)}</dt>
        <dd>
          <span className={big ? styles.number : f.copy ? styles.code : undefined}>{value}</span>
          {f.copy ? <CopyButton value={a[f.key]!.replace(/\s+/g, "")} label={f.label.toLowerCase()} /> : null}
        </dd>
      </div>
    );
  };
  return (
    <>
      {main.map(row)}
      {abroad.length ? (
        <div className={styles.subgroup}>
          <p className={styles.subhead}>From abroad</p>
          {abroad.map(row)}
        </div>
      ) : null}
      {correspondent.length ? (
        <div className={styles.subgroup}>
          <p className={styles.subhead}>Correspondent bank</p>
          {correspondent.map(row)}
        </div>
      ) : null}
    </>
  );
}
