"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteAlbum, saveAlbum } from "@/app/actions/admin/gallery";
import { SaveBar, TextInput, Toggle } from "@/components/admin/fields";
import { Icon } from "@/components/admin/Icon";
import { DropZone, UploadProgressList, useUploads } from "@/components/admin/ImageFields";
import { MediaDialog } from "@/components/admin/MediaDialog";
import { image, imageKey, thumbUrl, type ImageRef } from "@/content/images";
import styles from "@/components/admin/admin.module.css";

export type AlbumValues = { title: string; slug: string; published: boolean; photos: { id?: string; image: ImageRef; caption: string }[] };

export function AlbumForm({ id, values, justSaved }: { id: string | null; values: AlbumValues; justSaved?: boolean }) {
  const [state, action, pending] = useActionState(saveAlbum.bind(null, id), justSaved ? { ok: true as const, message: "Album created" } : null);
  const [photos, setPhotos] = useState(values.photos);
  const [library, setLibrary] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleting, startDelete] = useTransition();
  const uploads = useUploads((ref) => setPhotos((p) => [...p, { image: ref, caption: ref.alt }]));

  const move = (i: number, d: -1 | 1) =>
    setPhotos((p) => {
      const next = [...p];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <TextInput name="title" label="Album name" required defaultValue={values.title} maxLength={120} help="Shown as a tab on the gallery page." />
            <TextInput name="slug" label="Short name" defaultValue={values.slug} maxLength={80} help="Letters, numbers and dashes. Made from the name if empty." />
          </div>
          <Toggle name="published" label="Show on the site" defaultChecked={values.published} />
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Photos</h2>
        <p className={styles.cardLead}>
          Drop in as many as you like: each is compressed before upload. Captions appear when a photo is opened. Remember to save.
        </p>
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        <div className={styles.fields}>
          <DropZone multiple onFiles={(f) => uploads.start(f)} />
          <UploadProgressList jobs={uploads.jobs} />
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setLibrary(true)}>
              Add from the media library
            </button>
            <span className={`${styles.small} ${styles.muted}`}>
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </span>
          </div>
          {photos.length ? (
            <ul className={styles.images}>
              {photos.map((p, i) => (
                <li key={`${p.id ?? imageKey(p.image)}-${i}`} className={styles.imageCard}>
                  <div className={styles.imageFrame}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(p.image, 480)} alt="" loading="lazy" />
                    <div className={styles.imageTools}>
                      <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                        <Icon name="up" />
                      </button>
                      <button type="button" className={styles.iconButton} onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move later">
                        <Icon name="down" />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        data-danger
                        onClick={() => setPhotos((list) => list.filter((_, k) => k !== i))}
                        aria-label="Remove from album"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                  <input
                    className={styles.input}
                    value={p.caption}
                    maxLength={300}
                    placeholder="Caption"
                    aria-label={`Caption for photo ${i + 1}`}
                    onChange={(e) => setPhotos((list) => list.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <MediaDialog
        multiple
        open={library}
        onClose={() => setLibrary(false)}
        onPick={(refs) => setPhotos((p) => [...p, ...refs.map((ref) => ({ image: ref, caption: image(ref).alt }))])}
      />

      <SaveBar pending={pending || uploads.busy} state={state} label={uploads.busy ? "Uploading…" : "Save album"}>
        {id ? (
          confirm ? (
            <>
              <button type="button" className={styles.dangerButton} disabled={deleting} onClick={() => startDelete(async () => void (await deleteAlbum(id)))}>
                Yes, delete album
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className={styles.ghostButton} onClick={() => setConfirm(true)}>
              Delete album
            </button>
          )
        ) : null}
      </SaveBar>
    </form>
  );
}
