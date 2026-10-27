"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./admin.module.css";

type Base = { name: string; label: string; help?: ReactNode; required?: boolean };

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className={styles.label}>
      {label}
      {required ? null : <span className={styles.muted}> (optional)</span>}
    </span>
  );
}

export function TextInput({
  name,
  label,
  help,
  required,
  defaultValue,
  type = "text",
  maxLength = 200,
  placeholder,
  onValue,
  readOnly,
}: Base & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "url" | "number" | "datetime-local" | "password";
  maxLength?: number;
  placeholder?: string;
  onValue?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className={styles.field}>
      <Label label={label} required={required} />
      {help ? <span className={styles.help}>{help}</span> : null}
      <input
        className={styles.input}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        maxLength={type === "number" ? undefined : maxLength}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onValue ? (e) => onValue(e.target.value) : undefined}
      />
    </label>
  );
}

export function TextArea({
  name,
  label,
  help,
  required,
  defaultValue,
  rows = 4,
  tall,
  maxLength = 20000,
}: Base & { defaultValue?: string | null; rows?: number; tall?: boolean; maxLength?: number }) {
  return (
    <label className={styles.field}>
      <Label label={label} required={required} />
      {help ? <span className={styles.help}>{help}</span> : null}
      <textarea
        className={styles.textarea}
        data-tall={tall || undefined}
        name={name}
        rows={rows}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
      />
    </label>
  );
}

export function Select({
  name,
  label,
  help,
  required,
  defaultValue,
  options,
}: Base & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <label className={styles.field}>
      <Label label={label} required={required} />
      {help ? <span className={styles.help}>{help}</span> : null}
      <select className={styles.select} name={name} required={required} defaultValue={defaultValue ?? ""}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ name, label, help, defaultChecked }: { name: string; label: string; help?: string; defaultChecked?: boolean }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span className={styles.checkText}>
        <strong>{label}</strong>
        {help ? <span className={styles.help}>{help}</span> : null}
      </span>
    </label>
  );
}

function RowTools({ i, count, onMove, onRemove }: { i: number; count: number; onMove: (i: number, d: -1 | 1) => void; onRemove: (i: number) => void }) {
  return (
    <div className={styles.iconRow}>
      <button type="button" className={styles.iconButton} onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="Move up">
        <Icon name="up" />
      </button>
      <button type="button" className={styles.iconButton} onClick={() => onMove(i, 1)} disabled={i === count - 1} aria-label="Move down">
        <Icon name="down" />
      </button>
      <button type="button" className={styles.iconButton} data-danger onClick={() => onRemove(i)} aria-label="Remove">
        <Icon name="trash" />
      </button>
    </div>
  );
}

function useRows<T>(initial: T[]) {
  const [rows, setRows] = useState(initial);
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const next = [...r];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const remove = (i: number) => setRows((r) => r.filter((_, k) => k !== i));
  const set = (i: number, value: T) => setRows((r) => r.map((x, k) => (k === i ? value : x)));
  return { rows, setRows, move, remove, set };
}

/** A list of short lines (e.g. what a programme covers). Sent as JSON. */
export function LinesInput({ name, label, help, value, addLabel = "Add a line" }: Base & { value: string[]; addLabel?: string }) {
  const { rows, setRows, move, remove, set } = useRows(value);
  return (
    <div className={styles.field}>
      <Label label={label} required />
      {help ? <span className={styles.help}>{help}</span> : null}
      <input type="hidden" name={name} value={JSON.stringify(rows.map((r) => r.trim()).filter(Boolean))} />
      <div className={styles.repeat}>
        {rows.map((r, i) => (
          <div key={i} className={styles.repeatRow}>
            <input className={styles.input} value={r} maxLength={200} onChange={(e) => set(i, e.target.value)} aria-label={`${label} ${i + 1}`} />
            <RowTools i={i} count={rows.length} onMove={move} onRemove={remove} />
          </div>
        ))}
      </div>
      <button type="button" className={`${styles.secondaryButton} ${styles.addButton}`} onClick={() => setRows((r) => [...r, ""])}>
        <Icon name="plus" /> {addLabel}
      </button>
    </div>
  );
}

export type Column = { key: string; label: string; long?: boolean; type?: "text" | "number" | "url"; width?: "narrow" };

/** Repeating groups of fields (steps, bank accounts, figures, links). Sent as JSON. */
export function RowsInput({
  name,
  label,
  help,
  columns,
  value,
  addLabel = "Add",
  min = 0,
}: Base & { columns: Column[]; value: Record<string, string | number>[]; addLabel?: string; min?: number }) {
  const blank = Object.fromEntries(columns.map((c) => [c.key, ""]));
  const { rows, setRows, move, remove, set } = useRows(value);
  const clean = rows.map((r) =>
    Object.fromEntries(columns.map((c) => [c.key, c.type === "number" ? Number(r[c.key]) || 0 : String(r[c.key] ?? "").trim()])),
  );
  return (
    <div className={styles.field}>
      <Label label={label} required />
      {help ? <span className={styles.help}>{help}</span> : null}
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
      <div className={styles.repeat}>
        {rows.map((r, i) => (
          <div key={i} className={styles.repeatRow}>
            <div className={styles.repeatFields} data-cols={columns.filter((c) => !c.long).length}>
              {columns.map((c) => (
                <label key={c.key} className={styles.field} data-long={c.long || undefined} data-narrow={c.width === "narrow" || undefined}>
                  <span className={styles.help}>{c.label}</span>
                  {c.long ? (
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      value={String(r[c.key] ?? "")}
                      onChange={(e) => set(i, { ...r, [c.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={styles.input}
                      type={c.type ?? "text"}
                      value={String(r[c.key] ?? "")}
                      onChange={(e) => set(i, { ...r, [c.key]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            <RowTools i={i} count={rows.length} onMove={move} onRemove={(k) => (rows.length > min ? remove(k) : undefined)} />
          </div>
        ))}
      </div>
      <button type="button" className={`${styles.secondaryButton} ${styles.addButton}`} onClick={() => setRows((r) => [...r, { ...blank }])}>
        <Icon name="plus" /> {addLabel}
      </button>
    </div>
  );
}

export type SaveState = { ok: true; message?: string; id?: string } | { ok: false; error: string } | null;

/** Sticky bar with the save button and the result of the last save. */
export function SaveBar({ pending, state, label = "Save changes", children }: { pending: boolean; state: SaveState; label?: string; children?: ReactNode }) {
  return (
    <div className={styles.saveBar}>
      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : label}
      </button>
      {children}
      <span className={styles.status} data-tone={state ? (state.ok ? "ok" : "error") : undefined} role="status" aria-live="polite">
        {pending ? "" : state ? (state.ok ? (state.message ?? "Saved") : state.error) : ""}
      </span>
    </div>
  );
}
