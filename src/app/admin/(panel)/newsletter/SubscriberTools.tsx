"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeSubscriber, resendConfirmations } from "@/app/actions/admin/newsletter";
import { Icon } from "@/components/admin/Icon";
import { formatDate } from "@/components/admin/ui";
import styles from "@/components/admin/admin.module.css";

type Row = { id: string; email: string; created_at: string; confirmed_at: string | null };

export function SubscriberTools({ rows, pendingCount, showResend }: { rows: Row[]; pendingCount: number; showResend: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <>
      {showResend && pendingCount ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await resendConfirmations();
                setMessage({ ok: r.ok, text: r.ok ? (r.message ?? "") : r.error });
              })
            }
          >
            Resend confirmation emails
          </button>
        </div>
      ) : null}
      {message ? (
        <p className={styles.status} data-tone={message.ok ? "ok" : "error"} role="status">
          {message.text}
        </p>
      ) : null}
      {rows.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Signed up</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td className={`${styles.small} ${styles.muted}`}>{formatDate(r.confirmed_at ?? r.created_at)}</td>
                  <td>
                    {confirmId === r.id ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              await removeSubscriber(r.id);
                              setConfirmId(null);
                              router.refresh();
                            })
                          }
                        >
                          Remove
                        </button>
                        <button type="button" className={styles.ghostButton} onClick={() => setConfirmId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" className={styles.iconButton} data-danger onClick={() => setConfirmId(r.id)} aria-label={`Remove ${r.email}`}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>Nobody here yet.</div>
      )}
    </>
  );
}
