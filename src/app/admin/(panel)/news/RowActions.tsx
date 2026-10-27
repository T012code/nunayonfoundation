"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteArticleInList, setFeatured } from "@/app/actions/admin/news";
import styles from "@/components/admin/admin.module.css";

/** In the News list: show a story on the home page, or delete it, without opening it. */
export function FeatureToggle({ id, featured, title }: { id: string; featured: boolean; title: string }) {
  const router = useRouter();
  const [on, setOn] = useState(featured);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <span className={styles.rowToggle}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Show "${title}" on the home page`}
        className={styles.switch}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const next = !on;
            setOn(next);
            const r = await setFeatured(id, next);
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

export function DeleteStory({ id, title }: { id: string; title: string }) {
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
        aria-label={`Delete "${title}"`}
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
            const r = await deleteArticleInList(id);
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
