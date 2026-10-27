"use client";

import { useActionState } from "react";
import { setPassword } from "@/app/actions/admin/auth";
import { Button } from "@/components/ui/Button";
import styles from "@/components/admin/admin.module.css";

export default function SetPasswordPage() {
  const [state, action, pending] = useActionState(setPassword, {});
  return (
    <form className={styles.fields} action={action}>
      <h1 className={styles.authTitle}>Choose a password</h1>
      <p className={styles.muted}>At least 12 characters. A short sentence you&apos;ll remember works well.</p>
      {state.error ? (
        <p className={styles.notice} data-tone="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input className={styles.input} name="password" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Type it again</span>
        <input className={styles.input} name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      <Button type="submit" variant="primary" loading={pending}>
        Save password
      </Button>
    </form>
  );
}
