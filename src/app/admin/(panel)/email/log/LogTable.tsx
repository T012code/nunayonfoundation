"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEmailLog, resendEmail } from "@/app/actions/admin/email-log";
import { Badge, formatTime } from "@/components/admin/ui";
import styles from "@/components/admin/admin.module.css";

export type LogEntry = {
  id: number;
  created_at: string;
  kind: string;
  label: string;
  to_address: string;
  subject: string;
  status: "sent" | "failed";
  error: string;
};

/** The sent-email list with quick actions: resend, delete, and delete in bulk. */
export function LogTable({ rows, total, first }: { rows: LogEntry[]; total: number; first: number }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [confirm, setConfirm] = useState<number | "picked" | "all" | null>(null);
  const [busyId, setBusyId] = useState<number | "bulk" | null>(null);
  const [, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const act = (id: number | "bulk", fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) => {
    setBusyId(id);
    start(async () => {
      const r = await fn();
      setNote({ ok: r.ok, text: (r.ok ? r.message : r.error) ?? "" });
      setBusyId(null);
      setConfirm(null);
      if (r.ok) {
        setPicked(new Set());
        router.refresh();
      }
    });
  };
  const toggle = (id: number) =>
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allPicked = rows.every((r) => picked.has(r.id));

  return (
    <>
      <div className={styles.toolbar}>
        <p className={`${styles.small} ${styles.muted}`} aria-live="polite">
          {first}–{first + rows.length - 1} of {total}
          {picked.size ? ` · ${picked.size} selected` : ""}
        </p>
        <div className={styles.actions}>
          {confirm === "picked" || confirm === "all" ? (
            <>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={busyId === "bulk"}
                onClick={() => act("bulk", () => deleteEmailLog(confirm === "all" ? "all" : [...picked]))}
              >
                {confirm === "all" ? `Yes, clear all ${total}` : `Yes, delete ${picked.size}`}
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setConfirm(null)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {picked.size ? (
                <button type="button" className={styles.secondaryButton} onClick={() => setConfirm("picked")}>
                  Delete selected
                </button>
              ) : null}
              <button type="button" className={styles.ghostButton} onClick={() => setConfirm("all")}>
                Clear the log
              </button>
            </>
          )}
        </div>
      </div>
      {note ? (
        <p className={styles.status} data-tone={note.ok ? "ok" : "error"} role="status">
          {note.text}
        </p>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  className={styles.rowCheck}
                  checked={allPicked}
                  onChange={() => setPicked(allPicked ? new Set() : new Set(rows.map((r) => r.id)))}
                  aria-label="Select all on this page"
                />
              </th>
              <th scope="col">When</th>
              <th scope="col">To</th>
              <th scope="col">Email</th>
              <th scope="col">Result</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    className={styles.rowCheck}
                    checked={picked.has(r.id)}
                    onChange={() => toggle(r.id)}
                    aria-label={`Select the email to ${r.to_address}`}
                  />
                </td>
                <td className={`${styles.small} ${styles.muted} ${styles.nowrap}`}>{formatTime(r.created_at)}</td>
                <td className={styles.small}>{r.to_address}</td>
                <td className={styles.small}>
                  <strong>{r.label}</strong>
                  <span className={styles.muted}> · {r.subject}</span>
                </td>
                <td className={styles.small}>
                  {r.status === "sent" ? <Badge tone="green">Sent</Badge> : <Badge tone="red">Failed</Badge>}
                  {r.error ? <p className={styles.logError}>{r.error}</p> : null}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    {confirm === r.id ? (
                      <>
                        <button type="button" className={styles.dangerButton} disabled={busyId === r.id} onClick={() => act(r.id, () => deleteEmailLog([r.id]))}>
                          Delete
                        </button>
                        <button type="button" className={styles.ghostButton} onClick={() => setConfirm(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className={styles.secondaryButton} disabled={busyId === r.id} onClick={() => act(r.id, () => resendEmail(r.id))}>
                          {busyId === r.id ? "Sending…" : "Resend"}
                        </button>
                        <button type="button" className={styles.ghostButton} onClick={() => setConfirm(r.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
