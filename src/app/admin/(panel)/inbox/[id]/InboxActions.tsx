"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteSubmission, setStatus } from "@/app/actions/admin/inbox";
import styles from "@/components/admin/admin.module.css";

export function InboxActions({ id, status }: { id: string; status: "new" | "read" | "archived" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string>();
  const [confirm, setConfirm] = useState(false);
  const act = (s: "new" | "read" | "archived") =>
    start(async () => {
      const r = await setStatus(id, s);
      setMessage(r.ok ? r.message : r.error);
      router.refresh();
    });

  return (
    <div className={styles.fields}>
      <div className={styles.actions}>
        {status === "archived" ? (
          <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => act("read")}>
            Move back to inbox
          </button>
        ) : (
          <button type="button" className={styles.secondaryButton} disabled={pending} onClick={() => act("archived")}>
            Archive
          </button>
        )}
        <button type="button" className={styles.ghostButton} disabled={pending} onClick={() => act("new")}>
          Mark as new
        </button>
        {confirm ? (
          <>
            <button type="button" className={styles.dangerButton} disabled={pending} onClick={() => start(async () => void (await deleteSubmission(id)))}>
              Yes, delete for good
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" className={styles.ghostButton} onClick={() => setConfirm(true)}>
            Delete
          </button>
        )}
      </div>
      {message ? (
        <p className={styles.status} data-tone="ok" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
