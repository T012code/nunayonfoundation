"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteArticle, saveArticle } from "@/app/actions/admin/news";
import { SaveBar, Select, TextArea, TextInput, Toggle } from "@/components/admin/fields";
import { ImageField, ImagesField } from "@/components/admin/ImageFields";
import type { ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type ArticleValues = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: ImageRef | null;
  photos: ImageRef[];
  programme: string | null;
  published: boolean;
  published_at: string | null;
};

// datetime-local wants "2026-10-27T09:30" in local time.
const toLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function ArticleForm({
  id,
  values,
  programmes,
  justSaved,
}: {
  id: string | null;
  values: ArticleValues;
  programmes: { slug: string; title: string }[];
  justSaved?: boolean;
}) {
  const [state, action, pending] = useActionState(saveArticle.bind(null, id), justSaved ? { ok: true as const, message: "Story created" } : null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <div className={styles.fields}>
          <TextInput name="title" label="Title" required defaultValue={values.title} maxLength={200} />
          <TextArea name="excerpt" label="Summary" required rows={2} maxLength={400} defaultValue={values.excerpt} help="One or two sentences, shown on story cards and in search results." />
          <TextArea
            name="body"
            label="Story"
            required
            tall
            defaultValue={values.body}
            help="Leave a blank line between paragraphs. The first paragraph is shown larger."
          />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Photos</h2>
        <div className={styles.fields}>
          <ImageField name="image" label="Cover photo" required value={values.image} />
          <ImagesField name="photos" label="More photos" help="Shown inside the story, in this order." value={values.photos} />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Publishing</h2>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <Select
              name="programme"
              label="Programme"
              defaultValue={values.programme ?? ""}
              options={[{ value: "", label: "None" }, ...programmes.map((p) => ({ value: p.slug, label: p.title }))]}
            />
            <TextInput name="published_at" label="Date" type="datetime-local" defaultValue={toLocal(values.published_at)} help="Leave empty to use the moment you publish." />
          </div>
          <TextInput
            name="slug"
            label="Web address"
            defaultValue={values.slug}
            maxLength={80}
            help={<>nunayonfoundation.org/news/<strong>your-story</strong>. Made from the title if left empty.</>}
          />
          <Toggle name="published" label="Published" help="Visible on the site. Untick to keep it as a draft." defaultChecked={values.published} />
        </div>
      </section>

      <SaveBar pending={pending} state={state}>
        {id ? (
          confirm ? (
            <>
              <button type="button" className={styles.dangerButton} disabled={deleting} onClick={() => startDelete(async () => void (await deleteArticle(id)))}>
                Yes, delete this story
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
