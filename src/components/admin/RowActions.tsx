"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "@/components/admin/admin.module.css";

type Result = { ok: boolean; error?: string };

/** An on/off switch in a list row (e.g. "on the home page", "shown on the site"). */
export function RowSwitch({
  on: initial,
  label,
  action,
}: {
  on: boolean;
  label: string;
  action: (on: boolean) => Promise<Result>;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <span className={styles.rowToggle}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={styles.switch}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const next = !on;
            setOn(next);
            const r = await action(next);
            if (!r.ok) {
              setOn(!next);
              setError(r.error ?? "Couldn't change that.");
            }
            router.refresh();
          })
        }
      >
        <span aria-hidden="true" />
      </button>
      {error ? (
        <span className={styles.rowError} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

/** A delete button in a list row, with a confirm step. */
export function RowDelete({ label, action }: { label: string; action: () => Promise<Result> }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  if (!confirm) {
    return (
      <button
        type="button"
        className={styles.iconButton}
        data-danger=""
        onClick={() => setConfirm(true)}
        aria-label={label}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
        </svg>
      </button>
    );
  }
  return (
    <span className={styles.rowConfirm}>
      <button
        type="button"
        className={styles.dangerButton}
        disabled={pending}
        autoFocus
        onClick={() =>
          start(async () => {
            const r = await action();
            if (!r.ok) setError(r.error ?? "Couldn't delete it.");
            else router.refresh();
          })
        }
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      <button type="button" className={styles.ghostButton} onClick={() => setConfirm(false)} disabled={pending}>
        Cancel
      </button>
      {error ? (
        <span className={styles.rowError} role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
