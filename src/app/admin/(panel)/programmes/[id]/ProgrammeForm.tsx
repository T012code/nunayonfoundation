"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteProgramme, saveProgramme } from "@/app/actions/admin/programmes";
import { LinesInput, RowsInput, SaveBar, TextArea, TextInput, Toggle } from "@/components/admin/fields";
import { ImageField, ImagesField } from "@/components/admin/ImageFields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type ProgrammeValues = {
  title: string;
  slug: string;
  summary: string;
  intro: string;
  image: ImageRef | null;
  covers: string[];
  steps: { title: string; body: string }[];
  stat: { value: string; label: string };
  photos: ImageRef[];
  published: boolean;
};

export function ProgrammeForm({ id, values, justSaved }: { id: string | null; values: ProgrammeValues; justSaved?: boolean }) {
  const [state, action, pending] = useActionState(saveProgramme.bind(null, id), justSaved ? { ok: true as const, message: "Programme created" } : null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <div className={styles.fields}>
          <TextInput name="title" label="Name" required defaultValue={values.title} maxLength={120} />
          <TextArea name="summary" label="Summary" required rows={2} maxLength={300} defaultValue={values.summary} help="One line, shown on programme cards." />
          <TextArea name="intro" label="Introduction" required rows={4} maxLength={2000} defaultValue={values.intro} help="The opening paragraph of the programme page." />
          <ImageField name="image" label="Main photo" required value={values.image} />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>What it covers and how it works</h2>
        <div className={styles.fields}>
          <LinesInput name="covers" label="What it covers" value={values.covers} addLabel="Add an item" />
          <RowsInput
            name="steps"
            label="How it works"
            help="Shown as numbered steps, in this order."
            columns={[
              { key: "title", label: "Step" },
              { key: "body", label: "Description", long: true },
            ]}
            value={values.steps}
            addLabel="Add a step"
          />
          <div className={styles.row2}>
            <TextInput name="stat_value" label="Headline figure" defaultValue={values.stat?.value} maxLength={20} placeholder="2,400+" />
            <TextInput name="stat_label" label="What the figure counts" defaultValue={values.stat?.label} maxLength={80} placeholder="children kept in school" />
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Photos and publishing</h2>
        <div className={styles.fields}>
          <ImagesField name="photos" label="Photo strip" help="Shown on the programme page, in this order." value={values.photos} />
          <TextInput
            name="slug"
            label="Web address"
            defaultValue={values.slug}
            maxLength={80}
            help={<>nunayonfoundation.org/programmes/<strong>name</strong>. Made from the name if left empty. Changing it breaks old links.</>}
          />
          <Toggle name="published" label="Show on the site" defaultChecked={values.published} />
        </div>
      </section>

      <SaveBar pending={pending} state={state}>
        {id ? (
          confirm ? (
            <>
              <button type="button" className={styles.dangerButton} disabled={deleting} onClick={() => startDelete(async () => void (await deleteProgramme(id)))}>
                Yes, delete this programme
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className={styles.ghostButton} onClick={() => setConfirm(true)}>
              Delete
            </button>
          )
        ) : null}
      </SaveBar>
    </form>
  );
}
