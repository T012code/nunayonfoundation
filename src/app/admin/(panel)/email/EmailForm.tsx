"use client";

import { useActionState, useState, useTransition, type ReactNode } from "react";
import { saveMailSettings, sendTestEmail } from "@/app/actions/admin/email";
import { Icon } from "@/components/admin/Icon";
import { SaveBar, TextInput } from "@/components/admin/fields";
import type { MailSettings } from "@/lib/mail";
import styles from "@/components/admin/admin.module.css";

type Guide = {
  label: string;
  /** What's saved as the provider; hosts not built into the server are saved as "other". */
  provider: MailSettings["provider"];
  host?: string;
  port?: number;
  /** Which saved server means this guide (to reopen the right one). */
  match?: (host: string) => boolean;
  steps: ReactNode[];
  links: { label: string; href: string }[];
  limit?: string;
};

// Each provider's own short path to an app password, with direct links to the right pages.
const GUIDES: Record<string, Guide> = {
  gmail: {
    label: "Gmail / Google Workspace",
    provider: "gmail",
    steps: [
      "Sign in to the Google account you'll send from.",
      "Turn on 2-Step Verification if it isn't on already.",
      <>
        Open <strong>App passwords</strong>, type &ldquo;Nunayon website&rdquo; as the name and press Create.
      </>,
      "Copy the 16-letter password Google shows, and paste it in step 3 below.",
    ],
    links: [
      { label: "Turn on 2-Step Verification", href: "https://myaccount.google.com/signinoptions/two-step-verification" },
      { label: "Create an app password", href: "https://myaccount.google.com/apppasswords" },
    ],
    limit: "Up to 500 emails a day (2,000 on Google Workspace).",
  },
  microsoft365: {
    label: "Microsoft 365 / Outlook",
    provider: "microsoft365",
    steps: [
      <>
        Your Microsoft 365 admin turns on <strong>Authenticated SMTP</strong> for this mailbox: Admin centre → Users → pick the user → Mail → Manage
        email apps.
      </>,
      <>
        If the account uses two-step sign-in, open <strong>Security info</strong>, choose Add sign-in method → App password.
      </>,
      "Paste the app password (or the account password, if there's no two-step sign-in) in step 3 below.",
    ],
    links: [
      { label: "Open the Microsoft 365 admin centre", href: "https://admin.microsoft.com/#/users" },
      { label: "Create an app password", href: "https://mysignins.microsoft.com/security-info" },
    ],
    limit: "Up to 10,000 recipients a day.",
  },
  zoho: {
    label: "Zoho Mail",
    provider: "zoho",
    steps: [
      <>
        In Zoho, open <strong>Security → App passwords</strong> and press Generate new password.
      </>,
      "Name it “Nunayon website”, then copy the password Zoho shows.",
      "Paste it in step 3 below. (Accounts in Zoho's EU data centre: choose Other provider and use smtp.zoho.eu.)",
    ],
    links: [{ label: "Create an app password", href: "https://accounts.zoho.com/home#security/app_password" }],
  },
  yahoo: {
    label: "Yahoo Mail",
    provider: "other",
    host: "smtp.mail.yahoo.com",
    port: 465,
    match: (h) => h === "smtp.mail.yahoo.com",
    steps: [
      <>
        Open <strong>Account security</strong> and choose Generate app password.
      </>,
      "Name it “Nunayon website”, then copy the password Yahoo shows.",
      "Paste it in step 3 below.",
    ],
    links: [{ label: "Create an app password", href: "https://login.yahoo.com/account/security" }],
  },
  hostinger: {
    label: "Hostinger email",
    provider: "other",
    host: "smtp.hostinger.com",
    port: 465,
    match: (h) => h === "smtp.hostinger.com",
    steps: [
      "Use the full email address and the mailbox's own password (set in hPanel → Emails).",
      "Paste the password in step 3 below.",
    ],
    links: [{ label: "Open Hostinger hPanel", href: "https://hpanel.hostinger.com/" }],
  },
  namecheap: {
    label: "Namecheap Private Email",
    provider: "other",
    host: "mail.privateemail.com",
    port: 465,
    match: (h) => h === "mail.privateemail.com",
    steps: ["Use the full email address and the mailbox's own password.", "Paste the password in step 3 below."],
    links: [{ label: "Open Private Email", href: "https://privateemail.com/" }],
  },
  other: {
    label: "Other provider",
    provider: "other",
    steps: [
      "Ask your email provider (or website host) for its SMTP server and port, and whether it uses SSL (port 465) or STARTTLS (port 587).",
      "Fill them in below, with the mailbox's password or an app password.",
    ],
    links: [],
  },
};

/** Which guide matches what's saved. */
function initialGuide(v: MailSettings) {
  if (v.provider !== "other") return v.provider;
  return Object.entries(GUIDES).find(([, g]) => g.match?.(v.host))?.[0] ?? "other";
}

export function EmailForm({ values }: { values: MailSettings }) {
  const [state, action, pending] = useActionState(saveMailSettings, null);
  const [key, setKey] = useState(() => initialGuide(values));
  const [testing, start] = useTransition();
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const guide = GUIDES[key];
  const custom = key === "other";
  const connected = values.has_password && !!values.username;

  return (
    <form action={action} className={styles.form}>
      {connected ? (
        <p className={styles.status} data-tone="ok" role="status">
          Connected: sending from {values.from_email || values.username}. Change anything below, or send a test email to check it.
        </p>
      ) : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.stepNum}>1</span> Choose your email provider
        </h2>
        <div className={styles.providerGrid} role="radiogroup" aria-label="Email provider">
          {Object.entries(GUIDES).map(([k, g]) => (
            <label key={k} className={styles.providerTile}>
              <input type="radio" name="guide" value={k} checked={key === k} onChange={() => setKey(k)} />
              <span>{g.label}</span>
            </label>
          ))}
        </div>
        <input type="hidden" name="provider" value={guide.provider} />
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.stepNum}>2</span> {custom ? "Get the server details" : "Create an app password"}
        </h2>
        <p className={styles.cardLead}>
          {custom
            ? "Every provider has these; they're usually on its help pages."
            : "An app password lets the website send email without knowing the account's real password, and you can revoke it any time."}
        </p>
        <ol className={styles.guideSteps}>
          {guide.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        {guide.links.length ? (
          <div className={styles.actions}>
            {guide.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
                {l.label} <Icon name="external" />
              </a>
            ))}
          </div>
        ) : null}
        {guide.limit ? <p className={`${styles.small} ${styles.muted}`}>{guide.limit}</p> : null}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.stepNum}>3</span> Connect the mailbox
        </h2>
        <div className={styles.fields}>
          {guide.provider === "other" ? (
            <div className={styles.row2}>
              <TextInput
                key={`host-${key}`}
                name="host"
                label="SMTP server"
                required
                defaultValue={guide.host ?? (custom ? values.host : "")}
                placeholder="smtp.example.com"
                readOnly={!custom}
              />
              <TextInput
                key={`port-${key}`}
                name="port"
                label="Port"
                type="number"
                required
                defaultValue={guide.port ?? values.port}
                readOnly={!custom}
              />
            </div>
          ) : null}
          <div className={styles.row2}>
            <TextInput
              name="username"
              label="Email address"
              type="email"
              required
              defaultValue={values.username}
              placeholder="hello@nunayonfoundation.org"
            />
            <TextInput
              name="password"
              label={custom || guide.provider === "other" ? "Password" : "App password"}
              type="password"
              help={values.has_password ? "A password is saved. Leave empty to keep it." : "Stored encrypted. Nobody can read it back, including you."}
            />
          </div>
          <div className={styles.row3}>
            <TextInput name="from_name" label="Sender name" defaultValue={values.from_name} />
            <TextInput name="from_email" label="Send from" type="email" defaultValue={values.from_email} help="Usually the same address." />
            <TextInput name="reply_to" label="Replies go to" type="email" defaultValue={values.reply_to} help="Optional." />
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span className={styles.stepNum}>4</span> Save and check it works
        </h2>
        <p className={styles.cardLead}>Save, then send a test email to yourself. If it arrives, form alerts and newsletters will too.</p>
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
