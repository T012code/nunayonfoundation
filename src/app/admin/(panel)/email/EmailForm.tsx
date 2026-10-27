"use client";

import { useActionState, useState, useTransition } from "react";
import { saveMailSettings, sendTestEmail } from "@/app/actions/admin/email";
import { SaveBar, TextInput } from "@/components/admin/fields";
import type { MailSettings } from "@/lib/mail";
import styles from "@/components/admin/admin.module.css";

const PROVIDERS = [
  { value: "gmail", label: "Gmail / Google Workspace" },
  { value: "microsoft365", label: "Microsoft 365 / Outlook" },
  { value: "zoho", label: "Zoho Mail" },
  { value: "other", label: "Other provider" },
] as const;

const HELP: Record<string, React.ReactNode> = {
  gmail: (
    <>
      Turn on 2-Step Verification for the Google account, then create an <strong>app password</strong> at myaccount.google.com/apppasswords and paste
      it below. Gmail sends up to 500 emails a day (2,000 on Google Workspace).
    </>
  ),
  microsoft365: (
    <>
      Your Microsoft 365 admin must allow <strong>Authenticated SMTP</strong> for this mailbox (Admin centre → Users → Mail → Manage email apps). If
      the account uses two-step sign-in, create an app password. Up to 10,000 recipients a day.
    </>
  ),
  zoho: (
    <>
      In Zoho Mail, go to My Account → Security → <strong>App passwords</strong> and create one for &ldquo;Website&rdquo;. If your account is in the
      EU data centre, choose &ldquo;Other provider&rdquo; and use smtp.zoho.eu.
    </>
  ),
  other: <>Ask your email provider for its SMTP server, port and whether to use SSL (port 465) or STARTTLS (port 587).</>,
};

export function EmailForm({ values }: { values: MailSettings }) {
  const [state, action, pending] = useActionState(saveMailSettings, null);
  const [provider, setProvider] = useState(values.provider);
  const [testing, start] = useTransition();
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Provider</h2>
        <div className={styles.fields}>
          <div className={styles.checks} role="radiogroup" aria-label="Email provider">
            {PROVIDERS.map((p) => (
              <label key={p.value} className={styles.check}>
                <input type="radio" name="provider" value={p.value} checked={provider === p.value} onChange={() => setProvider(p.value)} />
                <span className={styles.checkText}>
                  <strong>{p.label}</strong>
                </span>
              </label>
            ))}
          </div>
          <div className={styles.notice}>{HELP[provider]}</div>
          {provider === "other" ? (
            <div className={styles.row2}>
              <TextInput name="host" label="SMTP server" required defaultValue={values.host} placeholder="smtp.example.com" />
              <TextInput name="port" label="Port" type="number" required defaultValue={values.port} />
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Mailbox</h2>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <TextInput name="username" label="Sign-in email" type="email" required defaultValue={values.username} placeholder="hello@nunayonfoundation.org" />
            <TextInput
              name="password"
              label="App password"
              type="password"
              help={values.has_password ? "A password is saved. Leave empty to keep it." : "Stored encrypted. Nobody can read it back, including you."}
            />
          </div>
          <div className={styles.row3}>
            <TextInput name="from_name" label="Sender name" defaultValue={values.from_name} />
            <TextInput name="from_email" label="Send from" type="email" defaultValue={values.from_email} help="Usually the same as the sign-in email." />
            <TextInput name="reply_to" label="Replies go to" type="email" defaultValue={values.reply_to} help="Optional." />
          </div>
        </div>
      </section>

      <SaveBar pending={pending} state={state}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={testing}
          onClick={() =>
            start(async () => {
              const r = await sendTestEmail();
              setTest({ ok: r.ok, text: r.ok ? (r.message ?? "Sent") : r.error });
            })
          }
        >
          {testing ? "Sending…" : "Send a test email"}
        </button>
        {test ? (
          <span className={styles.status} data-tone={test.ok ? "ok" : "error"} role="status">
            {test.text}
          </span>
        ) : null}
      </SaveBar>
    </form>
  );
}
