"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin/result";
import styles from "./admin.module.css";

/**
 * "Send a test to…": an address box (filled with your own address) and a send button.
 * Not a form of its own, so it can sit inside another form without submitting it.
 */
export function TestSend({
  defaultTo,
  send,
  label = "Send a test",
}: {
  defaultTo: string;
  send: (to: string) => Promise<ActionResult>;
  label?: string;
}) {
  const [to, setTo] = useState(defaultTo);
  const [busy, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const go = () =>
    start(async () => {
      const r = await send(to.trim());
      setResult({ ok: r.ok, text: r.ok ? (r.message ?? "Sent") : r.error });
    });

  return (
    <div className={styles.testSend}>
      <label className={styles.field}>
        <span className={styles.label}>Send the test to</span>
        <span className={styles.testSendRow}>
          <input
            className={styles.input}
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                go();
              }
            }}
            placeholder="name@example.com"
            autoComplete="email"
          />
          <button type="button" className={styles.secondaryButton} disabled={busy || !to.trim()} onClick={go}>
            {busy ? "Sending…" : label}
          </button>
        </span>
      </label>
      {result ? (
        <p className={styles.status} data-tone={result.ok ? "ok" : "error"} role="status">
          {result.text}
        </p>
      ) : null}
    </div>
  );
}
