"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./forms.module.css";

export const CURRENCIES = [
  { code: "NGN", symbol: "₦", flag: "ng", name: "Naira" },
  { code: "USD", symbol: "$", flag: "us", name: "US dollar" },
  { code: "GBP", symbol: "£", flag: "gb", name: "British pound" },
] as const;

type Code = (typeof CURRENCIES)[number]["code"];

type Props = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  onEdit?: (name: string) => void;
};

/** "25000.5" → "25,000.5" while typing; anything but digits and one point is dropped. */
function group(raw: string) {
  const clean = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = clean.split(".");
  const grouped = whole.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rest.length ? `${grouped}.${rest.join("").slice(0, 2)}` : grouped;
}

/**
 * An amount with its currency, styled like the phone field: a small currency picker (naira,
 * dollar, pound) in front of the number. Digits are grouped as they're typed. The form
 * receives one value such as "£250 GBP" in a hidden input.
 */
export function AmountField({ name, label, required, placeholder, error, onEdit }: Props) {
  const id = `f-${name}`;
  const [currency, setCurrency] = useState<Code>("NGN");
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const c = CURRENCIES.find((x) => x.code === currency)!;
  const number = Number(value.replace(/,/g, ""));

  // The form's own validation reads this, so a zero or unreadable amount blocks submission.
  useEffect(() => {
    inputRef.current?.setCustomValidity(value && !(number > 0) ? "Enter the amount you sent, like 25,000." : "");
  }, [value, number]);

  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? null : <span className={styles.optional}> (optional)</span>}
      </label>
      <div className={styles.phone}>
        <span className={styles.amountCurrency}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 20px decorative SVG flag. */}
          <img className={styles.flag} src={`/flags/${c.flag}.svg`} alt="" width={20} height={14} />
          <span aria-hidden="true">{c.symbol}</span>
          <select
            value={currency}
            aria-label={`Currency: ${c.name}. Change currency`}
            onChange={(e) => {
              setCurrency(e.target.value as Code);
              onEdit?.(name);
              inputRef.current?.focus();
            }}
          >
            {CURRENCIES.map((x) => (
              <option key={x.code} value={x.code}>
                {x.symbol} {x.name} ({x.code})
              </option>
            ))}
          </select>
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={styles.phoneInput}
          value={value}
          maxLength={18}
          placeholder={placeholder}
          required={required}
          data-name={name}
          data-label={label}
          onChange={(e) => {
            onEdit?.(name);
            setValue(group(e.target.value));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <input type="hidden" name={name} value={value ? `${c.symbol}${value} ${c.code}` : ""} />
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.75v3.75M8 11h.01" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
