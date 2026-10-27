"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin/settings";
import { RowsInput, SaveBar, TextArea, TextInput } from "@/components/admin/fields";
import { ImagesField } from "@/components/admin/ImageFields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type SettingsValues = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  notify_email: string;
  socials: { label: string; href: string }[];
  bank_accounts: { currency: string; bank: string; name: string; number: string }[];
  impact: { value: number; suffix: string; label: string }[];
  hero: { title?: string; lead?: string; slides?: ImageRef[] };
};

export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className={styles.form}>
      <section className={styles.card} id="contact">
        <h2 className={styles.cardTitle}>Contact details</h2>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <TextInput name="email" label="Public email" type="email" required defaultValue={values.email} />
            <TextInput name="phone" label="Phone" defaultValue={values.phone} placeholder="+234 800 000 0000" />
          </div>
          <div className={styles.row2}>
            <TextInput name="whatsapp" label="WhatsApp number" defaultValue={values.whatsapp} placeholder="+234 800 000 0000" />
            <TextInput
              name="notify_email"
              label="Send form alerts to"
              type="email"
              defaultValue={values.notify_email}
              help="Not shown on the site. Every new message, volunteer and donation notice is emailed here."
            />
          </div>
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

      <section className={styles.card} id="giving">
        <h2 className={styles.cardTitle}>Bank accounts for donations</h2>
        <p className={styles.cardLead}>Shown on the Donate page and the home page. Add a dollar or pound account here when it&apos;s ready.</p>
        <RowsInput
          name="bank_accounts"
          label="Accounts"
          columns={[
            { key: "currency", label: "Currency (NGN, USD, GBP)" },
            { key: "bank", label: "Bank" },
            { key: "name", label: "Account name" },
            { key: "number", label: "Account number" },
          ]}
          value={values.bank_accounts}
          addLabel="Add an account"
        />
      </section>

      <section className={styles.card} id="impact">
        <h2 className={styles.cardTitle}>Impact figures</h2>
        <p className={styles.cardLead}>The numbers that count up on the home page. Up to four look best.</p>
        <RowsInput
          name="impact"
          label="Figures"
          columns={[
            { key: "value", label: "Number", type: "number" },
            { key: "suffix", label: "After the number (e.g. +)" },
            { key: "label", label: "What it counts" },
          ]}
          value={values.impact}
          addLabel="Add a figure"
        />
      </section>

      <section className={styles.card} id="home">
        <h2 className={styles.cardTitle}>Home page</h2>
        <div className={styles.fields}>
          <TextInput name="hero_title" label="Headline" required defaultValue={values.hero?.title} maxLength={140} />
          <TextArea name="hero_lead" label="Intro" rows={2} maxLength={400} defaultValue={values.hero?.lead} />
          <ImagesField name="slides" label="Slideshow photos" help="Wide, bright photos work best. The first one shows first." value={values.hero?.slides ?? []} />
        </div>
      </section>

      <SaveBar pending={pending} state={state} />
    </form>
  );
}
