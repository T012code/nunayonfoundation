"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  countryList,
  dialCode,
  formatAsYouType,
  isCountry,
  normalisePhone,
  splitPhone,
  type CountryCode,
} from "@/lib/phone";
import styles from "./forms.module.css";

// Where the visitor is, from the edge's country header. Browser language is no guide here
// (many Nigerian visitors use US English), so anyone we can't place starts on Nigeria.
let detected: Promise<CountryCode | null> | null = null;
function detectCountry() {
  detected ??= fetch("/api/geo", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<{ country: string | null }>) : { country: null }))
    .then(({ country }) => (isCountry(country) ? country : null))
    .catch(() => null);
  return detected;
}

// Flags are small SVGs served from /flags (country-flag-icons, MIT): emoji flags don't render on Windows.
function Flag({ code }: { code: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- 20px decorative SVGs; resizing adds nothing here.
  return <img className={styles.flag} src={`/flags/${code.toLowerCase()}.svg`} alt="" width={20} height={14} loading="lazy" />;
}

const countryName = (code: CountryCode) => countryList().find((c) => c.code === code)?.name ?? code;

/** Why the number can't be used for this country, or "" when it's fine (or empty). */
function problemFor(value: string, code: CountryCode) {
  return value.trim() && !normalisePhone(value, code)
    ? `That isn't a valid ${countryName(code)} number. Check the digits or change the country.`
    : "";
}

type Props = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  onEdit?: (name: string) => void;
  onReport?: (name: string, message: string) => void;
};

/**
 * A phone number with its country: the dialling code is pre-selected for where the visitor
 * is, can be changed from a searchable list with flags, and switches by itself when a number
 * is pasted with a "+". Digits are grouped as they're typed and checked for that country.
 * The form receives one international number (+2348012345678) in a hidden input.
 */
export function PhoneField({ name, label, required, hint, error, onEdit, onReport }: Props) {
  const id = `f-${name}`;
  const listId = `${id}-countries`;
  const [country, setCountry] = useState<CountryCode>("NG");
  const [chosen, setChosen] = useState(false);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (chosen) return;
    let live = true;
    detectCountry().then((c) => {
      if (live && c) setCountry(c);
    });
    return () => {
      live = false;
    };
  }, [chosen]);

  const countries = useMemo(() => (open ? countryList() : []), [open]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return countries;
    // Names that start with the query come first ("uni" → United …), then other matches.
    const hits = countries.filter((c) => c.name.toLowerCase().includes(q) || c.dial.startsWith(q) || c.code.toLowerCase() === q);
    const starts = (c: (typeof hits)[number]) => (c.name.toLowerCase().startsWith(q) || c.dial.startsWith(q) ? 0 : 1);
    return hits.sort((a, b) => starts(a) - starts(b));
  }, [countries, query]);

  // Close on a click outside the field.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // The form's own validation reads this, so an invalid number blocks submission.
  useEffect(() => {
    numberRef.current?.setCustomValidity(problemFor(national, country));
  }, [national, country]);

  const openList = () => {
    setQuery("");
    setOpen(true);
    queueMicrotask(() => {
      const i = countryList().findIndex((c) => c.code === country);
      setActive(Math.max(0, i));
      searchRef.current?.focus();
    });
  };

  const pick = (code: CountryCode) => {
    setCountry(code);
    setChosen(true);
    setOpen(false);
    onEdit?.(name);
    numberRef.current?.focus();
  };

  const digits = national.replace(/[^\d]/g, "");
  const full = national ? (normalisePhone(national, country) ?? `+${dialCode(country)}${digits}`) : "";

  const onType = (raw: string) => {
    onEdit?.(name);
    if (raw.trim().startsWith("+")) {
      // An international number: let it pick the country.
      const split = splitPhone(raw);
      if (split) {
        setCountry(split.country);
        setChosen(true);
        setNational(split.national);
        return;
      }
    }
    setNational(raw.length < national.length ? raw : formatAsYouType(raw, country));
  };

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={styles.field} ref={rootRef} data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? null : <span className={styles.optional}> (optional)</span>}
      </label>
      <div className={styles.phone}>
        <button
          type="button"
          className={styles.phoneCountry}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`Country code: +${dialCode(country)}. Change country`}
          onClick={() => (open ? setOpen(false) : openList())}
        >
          <Flag code={country} />
          <span>+{dialCode(country)}</span>
        </button>
        <input
          ref={numberRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={styles.phoneInput}
          value={national}
          maxLength={24}
          placeholder="Phone number"
          required={required}
          data-name={name}
          data-label={label}
          onChange={(e) => onType(e.target.value)}
          onBlur={() => {
            const problem = problemFor(national, country);
            if (problem) onReport?.(name, problem);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>
      {open ? (
        <div className={styles.countryPop}>
          <input
            ref={searchRef}
            type="search"
            className={styles.countrySearch}
            placeholder="Search country or code"
            aria-label="Search countries"
            aria-controls={listId}
            aria-activedescendant={matches[active] ? `${listId}-${matches[active].code}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (matches[active]) pick(matches[active].code);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <ul ref={listRef} id={listId} role="listbox" aria-label="Countries" className={styles.countryList}>
            {matches.map((c, i) => (
              <li
                key={c.code}
                id={`${listId}-${c.code}`}
                role="option"
                aria-selected={c.code === country}
                data-index={i}
                data-active={i === active || undefined}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(c.code)}
              >
                <Flag code={c.code} />
                <span className={styles.countryName}>{c.name}</span>
                <span className={styles.countryDial}>+{c.dial}</span>
              </li>
            ))}
            {matches.length === 0 ? <li className={styles.countryEmpty}>No matching country</li> : null}
          </ul>
        </div>
      ) : null}
      <input type="hidden" name={name} value={full} />
      {hint && !error ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
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
