"use client";

import { useState } from "react";
import { BANK_FIELDS, bankProblems, CURRENCIES, CURRENCY_LABELS, type BankAccount, type BankField, type Currency } from "@/content/bank";
import { Icon } from "./Icon";
import styles from "./admin.module.css";

const GROUP_TITLES = { abroad: "For payments from abroad", correspondent: "Correspondent bank (domiciliary accounts)" } as const;

/**
 * Donation bank accounts. Choosing a currency shows that currency's usual details: account
 * number for naira; SWIFT, routing and correspondent bank for dollars; sort code and IBAN for
 * pounds; IBAN for euros. Saved as JSON in the "bank_accounts" field.
 */
export function BankAccountsField({ value }: { value: BankAccount[] }) {
  const [list, setList] = useState<BankAccount[]>(value.length ? value : []);
  const set = (i: number, patch: Partial<BankAccount>) => setList((l) => l.map((a, k) => (k === i ? { ...a, ...patch } : a)));
  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      const next = [...l];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div className={styles.fields}>
      <input type="hidden" name="bank_accounts" value={JSON.stringify(list)} />
      <ol className={styles.copyList}>
        {list.map((a, i) => {
          const fields = BANK_FIELDS[a.currency];
          const main = fields.filter((f) => !f.group);
          const groups = (["abroad", "correspondent"] as const).map((g) => ({ g, fields: fields.filter((f) => f.group === g) })).filter((x) => x.fields.length);
          const problems = bankProblems(a);
          const input = (f: BankField) => (
            <label key={f.key} className={styles.field}>
              <span className={styles.label}>
                {f.label}
                {f.required ? null : <span className={styles.muted}> (optional)</span>}
              </span>
              {f.help ? <span className={styles.help}>{f.help}</span> : null}
              <input className={styles.input} value={a[f.key] ?? ""} onChange={(e) => set(i, { [f.key]: e.target.value })} />
            </label>
          );
          return (
            <li key={i} className={styles.copyItem}>
              <div className={styles.copyItemHead}>
                <strong>
                  {i + 1}. {CURRENCY_LABELS[a.currency]}
                  {a.bank ? ` · ${a.bank}` : ""}
                </strong>
              </div>
              <div className={styles.copyTools}>
                <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <Icon name="up" />
                </button>
                <button type="button" className={styles.iconButton} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move down">
                  <Icon name="down" />
                </button>
                <button type="button" className={styles.iconButton} data-danger="" onClick={() => setList((l) => l.filter((_, k) => k !== i))} aria-label="Remove this account">
                  <Icon name="trash" />
                </button>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Currency</span>
                <select className={styles.select} value={a.currency} onChange={(e) => set(i, { currency: e.target.value as Currency })}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {CURRENCY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.row2}>{main.map(input)}</div>
              {groups.map(({ g, fields: gf }) => (
                <details key={g} className={styles.bankGroup} open={gf.some((f) => a[f.key])}>
                  <summary>{GROUP_TITLES[g]}</summary>
                  <div className={styles.row2}>{gf.map(input)}</div>
                </details>
              ))}
              {problems.length && (a.number || a.iban) ? (
                <p className={styles.status} data-tone="error">
                  Check: {problems.join(", ")}.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className={styles.actions}>
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            className={styles.secondaryButton}
            onClick={() => setList((l) => [...l, { currency: c, bank: "", name: "Nunayon Foundation", number: "" }])}
          >
            <Icon name="plus" /> {c} account
          </button>
        ))}
      </div>
    </div>
  );
}
