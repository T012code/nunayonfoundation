"use client";

import { useActionState, useState } from "react";
import { forwardSubmission } from "@/app/actions/admin/inbox";
import styles from "@/components/admin/admin.module.css";

/** Send this message to a team member or any address, with an optional note. */
export function ForwardForm({ id, team }: { id: string; team: { name: string; email: string }[] }) {
  const [state, action, pending] = useActionState(forwardSubmission.bind(null, id), null);
  const [to, setTo] = useState("");
  return (
    <form action={action} className={styles.fields}>
      {team.length ? (
        <label className={styles.field}>
          <span className={styles.label}>Team member</span>
          <select className={styles.select} value={team.some((m) => m.email === to) ? to : ""} onChange={(e) => setTo(e.target.value)}>
            <option value="">Choose someone…</option>
            {team.map((m) => (
              <option key={m.email} value={m.email}>
                {m.name ? `${m.name} (${m.email})` : m.email}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>{team.length ? "Or any email address" : "Email address"}</span>
        <input className={styles.input} name="to" type="text" inputMode="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" />
        <span className={styles.help}>Several addresses? Separate them with commas.</span>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Note (optional)</span>
        <textarea className={styles.textarea} name="note" rows={3} maxLength={2000} placeholder="Could you call her back this week?" />
      </label>
      <div className={styles.actions}>
        <button type="submit" className={styles.secondaryButton} disabled={pending || !to.trim()}>
          {pending ? "Sending…" : "Forward"}
        </button>
        {state ? (
          <span className={styles.status} data-tone={state.ok ? "ok" : "error"} role="status">
            {state.ok ? state.message : state.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
