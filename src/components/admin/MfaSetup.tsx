"use client";

import { useEffect, useRef, useState } from "react";
import { logSignIn } from "@/app/actions/admin/auth";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/browser";
import styles from "./admin.module.css";

type Enrolment = { factorId: string; qr: string; secret: string };

/**
 * Authenticator app sign-in step. With an app already linked it asks for the 6-digit code;
 * otherwise it shows a QR code to link one first. `onDone` runs once the session is verified.
 */
export function MfaSetup({ enrolled, onDone }: { enrolled: boolean; onDone: () => void }) {
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return setError(error.message);
      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) return setFactorId(verified.id);
      // Clear any half-finished set-up before starting a fresh one.
      for (const f of data.all.filter((f) => f.factor_type === "totp" && f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const res = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
      if (res.error) return setError(res.error.message);
      setEnrolment({ factorId: res.data.id, qr: res.data.totp.qr_code, secret: res.data.totp.secret });
      setFactorId(res.data.id);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factorId) return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your app.");
    setPending(true);
    setError(undefined);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      // The sign-in stage shakes its card on this (no effect elsewhere).
      window.dispatchEvent(new Event("auth:error"));
      setPending(false);
      setError(error.message.includes("Invalid") ? "That code didn't work. Check the time on your phone and try the newest code." : error.message);
      return;
    }
    await logSignIn(enrolment ? "set up MFA" : "verified MFA");
    onDone();
  }

  const settingUp = !enrolled && enrolment;

  return (
    <form className={styles.fields} onSubmit={onSubmit}>
      {settingUp ? (
        <>
          <ol className={styles.small}>
            <li>Open an authenticator app on your phone (Google Authenticator, Microsoft Authenticator or 1Password).</li>
            <li>Scan this code, or type the key below.</li>
            <li>Enter the 6-digit code the app shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolment.qr} alt="QR code to link your authenticator app" className={styles.qr} />
          <p className={styles.secret} aria-label="Set-up key">
            {enrolment.secret}
          </p>
        </>
      ) : (
        <p className={styles.muted}>Enter the 6-digit code from your authenticator app.</p>
      )}
      {error ? (
        <p className={styles.notice} data-tone="error" role="alert">
          {error}
        </p>
      ) : null}
      <label className={styles.field}>
        <span className={styles.label}>Code</span>
        <input
          className={`${styles.input} ${styles.code}`}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus
        />
      </label>
      <Button type="submit" variant="primary" loading={pending} disabled={!factorId}>
        {settingUp ? "Link app and continue" : "Verify"}
      </Button>
    </form>
  );
}
