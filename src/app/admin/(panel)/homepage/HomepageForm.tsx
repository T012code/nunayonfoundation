"use client";

import { useActionState } from "react";
import { saveHomepage } from "@/app/actions/admin/settings";
import { RowsInput, SaveBar, TextArea, TextInput } from "@/components/admin/fields";
import { ImagesField } from "@/components/admin/ImageFields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type HomepageValues = {
  impact: { value: number; suffix: string; label: string }[];
  hero: { title?: string; lead?: string; slides?: ImageRef[] };
};

export function HomepageForm({ values }: { values: HomepageValues }) {
  const [state, action, pending] = useActionState(saveHomepage, null);
  return (
    <form action={action} className={styles.form}>
      <section className={styles.card} id="hero">
        <h2 className={styles.cardTitle}>Top of the page</h2>
        <p className={styles.cardLead}>The headline, intro and photo slideshow visitors see first.</p>
        <div className={styles.fields}>
          <TextInput name="hero_title" label="Headline" required defaultValue={values.hero?.title} maxLength={140} />
          <TextArea name="hero_lead" label="Intro" rows={2} maxLength={400} defaultValue={values.hero?.lead} />
          <ImagesField
            name="slides"
            label="Slideshow photos"
            help="Wide, bright photos work best. The first one shows first."
            value={values.hero?.slides ?? []}
          />
        </div>
      </section>

      <section className={styles.card} id="impact">
        <h2 className={styles.cardTitle}>Impact figures</h2>
        <p className={styles.cardLead}>The numbers that count up under the slideshow. Up to four look best.</p>
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

      <SaveBar pending={pending} state={state} />
    </form>
  );
}
