"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logSignIn } from "@/app/actions/admin/auth";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/browser";
import styles from "@/components/admin/admin.module.css";
import { Welcome } from "../Welcome";

const MESSAGES: Record<string, string> = {
  "no-access": "This account doesn't have access to the admin. Ask the super admin to add you.",
  link: "That link has expired or was already used. Request a new one below.",
};

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState(notice ? MESSAGES[notice] : undefined);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(undefined);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    });
    if (error) {
      setPending(false);
      setError(error.message === "Invalid login credentials" ? "That email and password don't match." : error.message);
      return;
    }
    setDone(true);
    await logSignIn("signed in");
    router.replace("/admin");
    router.refresh();
  }

  if (done) return <Welcome />;

  return (
    <form className={styles.fields} onSubmit={onSubmit}>
      <h1 className={styles.authTitle}>Sign in to the admin</h1>
      {error ? (
        <p className={styles.notice} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input className={styles.input} name="email" type="email" autoComplete="username" required />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input className={styles.input} name="password" type="password" autoComplete="current-password" required />
      </label>
      <Button type="submit" variant="primary" loading={pending}>
        Sign in
      </Button>
      <Link href="/admin/forgot" className={styles.textLink}>
        Forgot your password?
      </Link>
    </form>
  );
}
