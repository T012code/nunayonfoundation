"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin/settings";
import { BankAccountsField } from "@/components/admin/BankAccountsField";
import { RowsInput, SaveBar, TextArea, TextInput } from "@/components/admin/fields";
import type { BankAccount } from "@/content/bank";
import styles from "@/components/admin/admin.module.css";

export type SettingsValues = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  notify_email: string;
  socials: { label: string; href: string }[];
  bank_accounts: BankAccount[];
  activity_log_days: number;
  email_log_days: number;
};

export function SettingsForm({ values, team }: { values: SettingsValues; team: { name: string; email: string }[] }) {
  const alerts = values.notify_email
    .split(/[\s,;]+/)
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className={styles.form}>
      <section className={styles.card} id="contact">
        <h2 className={styles.cardTitle}>Contact details</h2>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <TextInput name="email" label="Public email" type="email" required defaultValue={values.email} />
            <TextInput name="phone" label="Phone" defaultValue={values.phone} placeholder="+234 806 000 0000" />
          </div>
          <TextInput name="whatsapp" label="WhatsApp number" defaultValue={values.whatsapp} placeholder="+234 806 000 0000" />
          <TextInput name="address" label="Office address" defaultValue={values.address} maxLength={300} />
          <RowsInput
            name="socials"
            label="Social media links"
            columns={[
              { key: "label", label: "Network" },
              { key: "href", label: "Link (https://…)", type: "url" },
            ]}
            value={values.socials}
            addLabel="Add a link"
          />
        </div>
      </section>

      <section className={styles.card} id="alerts">
        <h2 className={styles.cardTitle}>Form alerts</h2>
        <p className={styles.cardLead}>
          Who gets an email for every new message, volunteer sign-up and donation notice. Replying to an alert answers
          the person who wrote in.
        </p>
        <div className={styles.fields}>
          {team.length ? (
            <fieldset className={styles.copyGroup}>
              <legend>Team members</legend>
              <div className={styles.checks}>
                {team.map((m) => (
                  <label key={m.email} className={styles.check}>
                    <input type="checkbox" name="notify_members" value={m.email} defaultChecked={alerts.includes(m.email)} />
                    <span className={styles.checkText}>
                      <strong>{m.name || m.email}</strong>
                      <span className={styles.help}>{m.email}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <TextArea
            name="notify_other"
            label={team.length ? "Other email addresses" : "Email addresses"}
            rows={2}
            defaultValue={alerts.filter((a) => !team.some((m) => m.email === a)).join(", ")}
            help="Separate addresses with commas. They aren't shown on the site."
          />
        </div>
      </section>

      <section className={styles.card} id="giving">
        <h2 className={styles.cardTitle}>Bank accounts for donations</h2>
        <p className={styles.cardLead}>
          Shown on the Donate page and the home page, in this order; with more than one, visitors pick a currency. Each
          currency asks for the details senders in that currency need.
        </p>
        <BankAccountsField value={values.bank_accounts} />
      </section>

      <section className={styles.card} id="logs">
        <h2 className={styles.cardTitle}>How long logs are kept</h2>
        <p className={styles.cardLead}>Older entries are deleted automatically each night.</p>
        <div className={styles.row2}>
          <TextInput
            name="activity_log_days"
            label="Activity log (days)"
            type="number"
            required
            defaultValue={values.activity_log_days}
            help="Sign-ins and changes in the admin. 1 to 3650."
          />
          <TextInput
            name="email_log_days"
            label="Sent emails (days)"
            type="number"
            required
            defaultValue={values.email_log_days}
            help="Email → Sent emails. 1 to 3650."
          />
        </div>
      </section>

      <SaveBar pending={pending} state={state} />
    </form>
  );
}
