"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestReset } from "@/app/actions/admin/auth";
import { Button } from "@/components/ui/Button";
import styles from "@/components/admin/admin.module.css";

export default function ForgotPage() {
  const [state, action, pending] = useActionState(requestReset, { done: false });
  if (state.done) {
    return (
      <div className={styles.fields}>
        <h1 className={styles.authTitle}>Check your email</h1>
        <p>If that address belongs to a team member, a link to choose a new password is on its way. It expires in an hour.</p>
        <Link href="/admin/login" className={styles.textLink}>
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form className={styles.fields} action={action}>
      <h1 className={styles.authTitle}>Reset your password</h1>
      <p className={styles.muted}>Enter the email you sign in with and we&apos;ll send you a link.</p>
      {state.error ? (
        <p className={styles.notice} data-tone="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input className={styles.input} name="email" type="email" autoComplete="username" required />
      </label>
      <Button type="submit" variant="primary" loading={pending}>
        Send reset link
      </Button>
      <Link href="/admin/login" className={styles.textLink}>
        Back to sign in
      </Link>
    </form>
  );
}
