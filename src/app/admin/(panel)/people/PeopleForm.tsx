"use client";

import { useActionState, useState } from "react";
import { savePeople } from "@/app/actions/admin/people";
import { SaveBar } from "@/components/admin/fields";
import { Icon } from "@/components/admin/Icon";
import { ImageField } from "@/components/admin/ImageFields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type PersonValue = { id?: string; name: string; role: string; bio: string; image: ImageRef | null; published: boolean };

let next = 0;

export function PeopleForm({ people }: { people: PersonValue[] }) {
  const [state, action, pending] = useActionState(savePeople, null);
  // Stable keys so editing one card never resets another.
  const [list, setList] = useState(() => people.map((p) => ({ ...p, key: p.id ?? `new-${next++}` })));
  const set = (i: number, patch: Partial<PersonValue>) => setList((l) => l.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      const n = [...l];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="people" value={JSON.stringify(list, (k, v) => (k === "key" ? undefined : v))} />
      {list.map((p, i) => (
        <section key={p.key} className={styles.card}>
          <div className={styles.personGrid}>
            <ImageField label="Photo" value={p.image} onChange={(image) => set(i, { image })} />
            <div className={styles.fields}>
              <div className={styles.row2}>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input className={styles.input} value={p.name} maxLength={120} required onChange={(e) => set(i, { name: e.target.value })} />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Role</span>
                  <input className={styles.input} value={p.role} maxLength={120} placeholder="Trustee" onChange={(e) => set(i, { role: e.target.value })} />
                </label>
              </div>
              <label className={styles.field}>
                <span className={styles.label}>
                  Short bio <span className={styles.muted}>(optional)</span>
                </span>
                <textarea className={styles.textarea} rows={3} maxLength={1500} value={p.bio} onChange={(e) => set(i, { bio: e.target.value })} />
              </label>
              <div className={styles.actions}>
                <label className={styles.check}>
                  <input type="checkbox" checked={p.published} onChange={(e) => set(i, { published: e.target.checked })} />
                  <span className={styles.checkText}>
                    <strong>Show on the site</strong>
                  </span>
                </label>
                <div className={styles.iconRow}>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                    <Icon name="up" />
                  </button>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move down">
                    <Icon name="down" />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    data-danger
                    onClick={() => setList((l) => l.filter((_, k) => k !== i))}
                    aria-label={`Remove ${p.name || "board member"}`}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
      <button
        type="button"
        className={`${styles.secondaryButton} ${styles.addButton}`}
        onClick={() => setList((l) => [...l, { key: `new-${next++}`, name: "", role: "", bio: "", image: null, published: true }])}
      >
        <Icon name="plus" /> Add a board member
      </button>
      <SaveBar pending={pending} state={state} />
    </form>
  );
}
