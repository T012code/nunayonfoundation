"use client";

import { useRef, useState } from "react";
import { imageKey, thumbUrl, type ImageRef, type MediaRef } from "@/content/images";
import { formatBytes } from "@/lib/admin/compress";
import { uploadPhoto, type UploadProgress } from "@/lib/admin/upload";
import { Icon } from "./Icon";
import { MediaDialog } from "./MediaDialog";
import styles from "./admin.module.css";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

type Job = { name: string; progress: UploadProgress | null; error?: string; saved?: string };

/** Uploads files one after another, reporting progress per file. */
function useUploads(onUploaded: (ref: MediaRef) => void) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const busy = jobs.some((j) => !j.error && !j.saved);

  async function start(files: File[]) {
    const fresh = files.map((f) => ({ name: f.name, progress: null }) as Job);
    const offset = jobs.length;
    setJobs((j) => [...j, ...fresh]);
    for (const [i, file] of files.entries()) {
      const at = offset + i;
      const update = (patch: Partial<Job>) => setJobs((j) => j.map((x, k) => (k === at ? { ...x, ...patch } : x)));
      try {
        const { ref, result } = await uploadPhoto(file, { onProgress: (progress) => update({ progress }) });
        update({ saved: `${formatBytes(result.bytesIn)} → ${formatBytes(result.bytesOut)}` });
        onUploaded(ref);
      } catch (err) {
        update({ error: err instanceof Error ? err.message : "Upload failed." });
      }
    }
  }

  const clearDone = () => setJobs((j) => j.filter((x) => !x.saved));
  return { jobs, busy, start, clearDone };
}

function Progress({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return null;
  return (
    <ul className={styles.jobs} aria-live="polite">
      {jobs.map((j, i) => {
        const p = j.progress;
        const share = j.saved ? 1 : p ? (p.stage === "compressing" ? 0.5 : 0.5) * (p.done / p.total) + (p.stage === "uploading" ? 0.5 : 0) : 0.04;
        return (
          <li key={i} className={styles.job} data-state={j.error ? "error" : j.saved ? "done" : "busy"}>
            <span className={styles.jobName}>{j.name}</span>
            <span className={styles.jobStatus}>
              {j.error ?? (j.saved ? `Saved · ${j.saved}` : p?.stage === "uploading" ? "Uploading…" : "Compressing…")}
            </span>
            {!j.error ? (
              <span className={styles.progress} aria-hidden="true">
                <span style={{ transform: `scaleX(${share})` }} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** A drop zone that also opens the file picker. */
export function DropZone({ onFiles, multiple, disabled }: { onFiles: (files: File[]) => void; multiple?: boolean; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <>
      <button
        type="button"
        className={styles.drop}
        data-over={over || undefined}
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }}
      >
        <Icon name="upload" />
        <span>
          <strong>{multiple ? "Drop photos here" : "Drop a photo here"}</strong> or click to choose
        </span>
        <span>JPEG, PNG, WebP or iPhone HEIC. Compressed automatically before upload.</span>
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

/**
 * One image: preview, replace by upload or from the library, or remove. Sent as JSON in `name`,
 * or reported through `onChange` when the image belongs to a larger list.
 */
export function ImageField({
  name,
  label,
  help,
  value,
  required,
  onChange,
}: {
  name?: string;
  label: string;
  help?: string;
  value: ImageRef | null;
  required?: boolean;
  onChange?: (ref: ImageRef | null) => void;
}) {
  const [current, setState] = useState<ImageRef | null>(value);
  const setCurrent = (ref: ImageRef | null) => {
    setState(ref);
    onChange?.(ref);
  };
  const [library, setLibrary] = useState(false);
  const uploads = useUploads((ref) => setCurrent(ref));

  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {label}
        {required ? null : <span className={styles.muted}> (optional)</span>}
      </span>
      {help ? <span className={styles.help}>{help}</span> : null}
      {name ? <input type="hidden" name={name} value={current ? JSON.stringify(current) : ""} /> : null}
      <div className={styles.single}>
        {current ? (
          <div className={styles.imageFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl(current, 960)} alt="" />
          </div>
        ) : (
          <DropZone onFiles={(f) => uploads.start(f)} disabled={uploads.busy} />
        )}
        <div className={styles.actions}>
          {current ? (
            <label className={styles.secondaryButton}>
              <Icon name="upload" /> Replace
              <input
                type="file"
                accept={ACCEPT}
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) uploads.start([f]);
                }}
              />
            </label>
          ) : null}
          <button type="button" className={styles.secondaryButton} onClick={() => setLibrary(true)}>
            Choose from library
          </button>
          {current && !required ? (
            <button type="button" className={styles.ghostButton} onClick={() => setCurrent(null)}>
              Remove
            </button>
          ) : null}
        </div>
        <Progress jobs={uploads.jobs} />
      </div>
      <MediaDialog open={library} onClose={() => setLibrary(false)} onPick={([ref]) => setCurrent(ref)} />
    </div>
  );
}

/** Several images in order: add by upload or from the library, reorder, remove. Sent as JSON. */
export function ImagesField({ name, label, help, value }: { name: string; label: string; help?: string; value: ImageRef[] }) {
  const [list, setList] = useState<ImageRef[]>(value);
  const [library, setLibrary] = useState(false);
  const uploads = useUploads((ref) => setList((l) => [...l, ref]));
  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      const next = [...l];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {help ? <span className={styles.help}>{help}</span> : null}
      <input type="hidden" name={name} value={JSON.stringify(list)} />
      {list.length ? (
        <ul className={styles.images}>
          {list.map((ref, i) => (
            <li key={`${imageKey(ref)}-${i}`} className={styles.imageCard}>
              <div className={styles.imageFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl(ref, 480)} alt="" loading="lazy" />
                <div className={styles.imageTools}>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                    <Icon name="up" />
                  </button>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move later">
                    <Icon name="down" />
                  </button>
                  <button type="button" className={styles.iconButton} data-danger onClick={() => setList((l) => l.filter((_, k) => k !== i))} aria-label="Remove">
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <DropZone multiple onFiles={(f) => uploads.start(f)} />
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={() => setLibrary(true)}>
          Choose from library
        </button>
      </div>
      <Progress jobs={uploads.jobs} />
      <MediaDialog multiple open={library} onClose={() => setLibrary(false)} onPick={(refs) => setList((l) => [...l, ...refs])} />
    </div>
  );
}

export { useUploads, Progress as UploadProgressList };
