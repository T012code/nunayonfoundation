"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { changePassword } from "@/app/actions/admin/account";
import { SaveBar } from "@/components/admin/fields";
import { MfaSetup } from "@/components/admin/MfaSetup";
import { formatDate } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/browser";
import styles from "@/components/admin/admin.module.css";

type Factor = { id: string; name: string; created: string };

export function AccountForms({ factors, mfaRequired }: { factors: Factor[]; mfaRequired: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(changePassword, null);
  const [settingUp, setSettingUp] = useState(false);
  const [busy, start] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Authenticator app</h2>
        {factors.length ? (
          <div className={styles.fields}>
            {factors.map((f) => (
              <div key={f.id} className={styles.actions}>
                <span>
                  <strong>{f.name}</strong> <span className={styles.muted}>· linked {formatDate(f.created)}</span>
                </span>
                {mfaRequired ? (
                  <span className={`${styles.small} ${styles.muted}`}>Required for your account. If you lose your phone, ask the super admin to reset it.</span>
                ) : (
                  <button
                    type="button"
                    className={styles.ghostButton}
                    disabled={busy}
                    onClick={() =>
                      start(async () => {
                        const { error } = await createClient().auth.mfa.unenroll({ factorId: f.id });
                        if (error) setError(error.message);
                        else router.refresh();
                      })
                    }
                  >
                    Turn off
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : settingUp ? (
          <div className={styles.single}>
            <MfaSetup
              enrolled={false}
              onDone={() => {
                setSettingUp(false);
                router.refresh();
              }}
            />
          </div>
        ) : (
          <div className={styles.fields}>
            <p className={styles.muted}>Add a code from your phone to every sign-in. Strongly recommended.</p>
            <button type="button" className={`${styles.primaryButton} ${styles.addButton}`} onClick={() => setSettingUp(true)}>
              Set up an authenticator app
            </button>
          </div>
        )}
        {error ? (
          <p className={styles.status} data-tone="error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <form action={action} className={styles.card}>
        <h2 className={styles.cardTitle}>Change password</h2>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span className={styles.label}>New password</span>
              <input className={styles.input} name="password" type="password" autoComplete="new-password" minLength={12} required />
              <span className={styles.help}>At least 12 characters.</span>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Type it again</span>
              <input className={styles.input} name="confirm" type="password" autoComplete="new-password" minLength={12} required />
            </label>
          </div>
        </div>
        <SaveBar pending={pending} state={state} label="Change password" />
      </form>
    </>
  );
}
