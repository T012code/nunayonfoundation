import type { ReactNode } from "react";
import styles from "./forms.module.css";

type Common = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onEdit?: (name: string) => void;
  className?: string;
};

function Wrap({ name, label, error, hint, required, className, children }: Common & { children: ReactNode }) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} data-invalid={error ? "" : undefined}>
      <label htmlFor={`f-${name}`} className={styles.label}>
        {label}
        {required ? null : <span className={styles.optional}> (optional)</span>}
      </label>
      {children}
      {hint && !error ? (
        <p id={`f-${name}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`f-${name}-error`} className={styles.error} role="alert">
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

function describedBy(name: string, error?: string, hint?: string) {
  return error ? `f-${name}-error` : hint ? `f-${name}-hint` : undefined;
}

export function TextField({
  type = "text",
  autoComplete,
  minLength,
  pattern,
  defaultValue,
  placeholder,
  ...c
}: Common & {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  minLength?: number;
  pattern?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <Wrap {...c}>
      <input
        id={`f-${c.name}`}
        name={c.name}
        type={type}
        className={styles.input}
        required={c.required}
        autoComplete={autoComplete}
        minLength={minLength}
        pattern={pattern}
        defaultValue={defaultValue}
        placeholder={placeholder}
        data-label={c.label}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        onInput={() => c.onEdit?.(c.name)}
      />
    </Wrap>
  );
}

export function TextArea({ rows = 5, minLength, ...c }: Common & { rows?: number; minLength?: number }) {
  return (
    <Wrap {...c}>
      <textarea
        id={`f-${c.name}`}
        name={c.name}
        rows={rows}
        className={`${styles.input} ${styles.textarea}`}
        required={c.required}
        minLength={minLength}
        data-label={c.label}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={describedBy(c.name, c.error, c.hint)}
        onInput={() => c.onEdit?.(c.name)}
      />
    </Wrap>
  );
}

export function SelectField({
  options,
  defaultValue,
  placeholder = "Choose one",
  onValue,
  ...c
}: Common & { options: string[]; defaultValue?: string; placeholder?: string; onValue?: (value: string) => void }) {
  return (
    <Wrap {...c}>
      <span className={styles.selectWrap}>
        <select
          id={`f-${c.name}`}
          name={c.name}
          className={`${styles.input} ${styles.select}`}
          required={c.required}
          defaultValue={defaultValue ?? ""}
          data-label={c.label}
          aria-invalid={c.error ? true : undefined}
          aria-describedby={describedBy(c.name, c.error, c.hint)}
          onChange={(e) => {
            c.onEdit?.(c.name);
            onValue?.(e.target.value);
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
    </Wrap>
  );
}

export function ChoiceGroup({
  name,
  legend,
  options,
  error,
  required,
  message,
  onEdit,
  type = "checkbox",
}: {
  name: string;
  legend: string;
  options: string[];
  error?: string;
  required?: boolean;
  message?: string;
  onEdit?: (name: string) => void;
  type?: "checkbox" | "radio";
}) {
  return (
    <fieldset
      className={styles.choices}
      data-required={required ? "" : undefined}
      data-name={name}
      data-message={message}
      data-invalid={error ? "" : undefined}
      aria-describedby={error ? `f-${name}-error` : undefined}
    >
      <legend className={styles.label}>
        {legend}
        {required ? null : <span className={styles.optional}> (optional)</span>}
      </legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <label key={o} className={styles.chip}>
            <input type={type} name={name} value={o} onChange={() => onEdit?.(name)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`f-${name}-error`} className={styles.error} role="alert">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.75v3.75M8 11h.01" />
          </svg>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
