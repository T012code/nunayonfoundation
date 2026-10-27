"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteMedia, updateAlt } from "@/app/actions/admin/media";
import { Icon } from "@/components/admin/Icon";
import { DropZone, UploadProgressList, useUploads } from "@/components/admin/ImageFields";
import { image, thumbUrl, type ImageRef } from "@/content/images";
import { formatBytes } from "@/lib/admin/compress";
import styles from "@/components/admin/admin.module.css";

export type LibraryItem = {
  /** The upload's id, or the built-in photo's name. */
  key: string;
  /** Uploaded in the admin, or built into the site (placeholders and defaults). */
  kind: "upload" | "builtin";
  ref: ImageRef;
  name: string;
  alt: string;
  width: number;
  height: number;
  sizes: number;
  bytes: number;
  format: "webp" | "jpg";
  created: string | null;
  usage: { label: string; href: string }[];
};

type Filter = "all" | "upload" | "builtin" | "unused";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upload", label: "Uploaded" },
  { key: "builtin", label: "Built-in" },
  { key: "unused", label: "Not used" },
];
const matches = (i: LibraryItem, f: Filter) => f === "all" || (f === "unused" ? i.usage.length === 0 : i.kind === f);
const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function MediaLibrary({ items, totalBytes }: { items: LibraryItem[]; totalBytes: number }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const uploads = useUploads(() => router.refresh());

  const counts = useMemo(
    () =>
      Object.fromEntries(FILTERS.map((f) => [f.key, items.filter((i) => matches(i, f.key)).length])) as Record<
        Filter,
        number
      >,
    [items],
  );
  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (i) => matches(i, filter) && (!q || i.name.toLowerCase().includes(q) || i.alt.toLowerCase().includes(q)),
  );
  const current = items.find((i) => i.key === openId) ?? null;
  const uploaded = items.filter((i) => i.kind === "upload").length;

  return (
    <>
      <section className={styles.card}>
        <DropZone multiple onFiles={(files) => uploads.start(files)} />
        <UploadProgressList jobs={uploads.jobs} />
      </section>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.tab}
              aria-current={filter === f.key || undefined}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className={styles.tabCount}>{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          className={`${styles.input} ${styles.search}`}
          placeholder="Search by file name or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search photos"
        />
        <span className={`${styles.small} ${styles.muted}`}>
          {uploaded} uploaded · {formatBytes(totalBytes)} stored · {items.length - uploaded} built in
        </span>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          {filter === "upload" && !q ? "No photos uploaded yet. Drop some above to start." : "No photos match."}
        </div>
      ) : (
        <ul className={styles.images}>
          {shown.map((i) => (
            <li key={i.key} className={styles.imageCard}>
              <button
                type="button"
                className={styles.pick}
                onClick={() => setOpenId(i.key)}
                aria-label={`Details for ${i.alt || i.name || "photo"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrl(i.ref, 300)}
                  alt=""
                  loading="lazy"
                  style={{ backgroundImage: `url(${image(i.ref).blur})` }}
                />
                <span className={styles.pickName}>{i.alt || i.name}</span>
              </button>
              <span className={styles.mediaMeta}>
                {i.usage.length ? (
                  <span className={styles.usedTag}>In use · {i.usage.length}</span>
                ) : (
                  <span className={styles.muted}>Not used</span>
                )}
                <span className={styles.muted}>{i.kind === "builtin" ? "Built in" : formatBytes(i.bytes)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {current ? <Details key={current.key} item={current} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

function Details({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [alt, setAlt] = useState(item.alt);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const builtin = item.kind === "builtin";
  const url = image(item.ref).src;

  return (
    <dialog
      ref={(d) => {
        dialog.current = d;
        if (d && !d.open) d.showModal();
      }}
      className={styles.dialog}
      onClose={onClose}
      aria-labelledby="media-details-title"
    >
      <div className={styles.dialogHead}>
        <h2 id="media-details-title" className={styles.cardTitle}>
          {item.name || "Photo"}
        </h2>
        <button type="button" className={styles.iconButton} onClick={() => dialog.current?.close()} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      <div />
      <div className={`${styles.dialogBody} ${styles.detailGrid}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.detailPhoto}
          src={thumbUrl(item.ref, 960)}
          alt=""
          style={{ backgroundImage: `url(${image(item.ref).blur})` }}
        />
        <div className={styles.fields}>
          <dl className={styles.dl}>
            <div>
              <dt>Size</dt>
              <dd>
                {item.width} × {item.height}px · {builtin ? "" : `${formatBytes(item.bytes)} for `}
                {item.sizes} sizes ({item.format.toUpperCase()})
              </dd>
            </div>
            <div>
              <dt>{builtin ? "Source" : "Uploaded"}</dt>
              <dd>{builtin || !item.created ? "Built into the site" : date.format(new Date(item.created))}</dd>
            </div>
            <div>
              <dt>Used in</dt>
              <dd>
                {item.usage.length ? (
                  <ul className={styles.usageList}>
                    {item.usage.map((u) => (
                      <li key={u.label}>
                        <Link href={u.href} className={styles.textLink}>
                          {u.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Nowhere yet"
                )}
              </dd>
            </div>
          </dl>
          {builtin ? (
            <p className={`${styles.small} ${styles.muted}`}>
              Description: {item.alt}. Built-in photos come with the site, so they can&apos;t be edited or deleted here.
              Use them anywhere through &ldquo;Choose from library&rdquo;.
            </p>
          ) : null}
          {builtin ? null : (
            <label className={styles.field}>
              <span className={styles.label}>Description (alt text)</span>
              <span className={styles.help}>
                What the photo shows, for people using screen readers. Applies where the photo is used next.
              </span>
              <textarea
                className={styles.textarea}
                value={alt}
                maxLength={300}
                rows={3}
                onChange={(e) => setAlt(e.target.value)}
              />
            </label>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={pending || alt === item.alt}
              onClick={() =>
                start(async () => {
                  const r = await updateAlt(item.key, alt);
                  setMessage(r.ok ? { tone: "ok", text: r.message ?? "Saved" } : { tone: "error", text: r.error });
                  if (r.ok) router.refresh();
                })
              }
            >
              Save description
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              Open full size <Icon name="external" />
            </a>
          </div>
          {message ? (
            <p className={styles.status} data-tone={message.tone} role="status">
              {message.text}
            </p>
          ) : null}
          {builtin ? null : (
            <div className={styles.dangerZone}>
              {item.usage.length ? (
                <p className={`${styles.small} ${styles.muted}`}>
                  To delete this photo, remove it from the places above first.
                </p>
              ) : confirming ? (
                <div className={styles.actions}>
                  <span className={styles.small}>Delete this photo and all its sizes for good?</span>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const r = await deleteMedia(item.key);
                        if (r.ok) {
                          dialog.current?.close();
                          router.refresh();
                        } else {
                          setMessage({ tone: "error", text: r.error });
                          setConfirming(false);
                        }
                      })
                    }
                  >
                    Yes, delete
                  </button>
                  <button type="button" className={styles.ghostButton} onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.dangerButton} onClick={() => setConfirming(true)}>
                  <Icon name="trash" /> Delete photo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
