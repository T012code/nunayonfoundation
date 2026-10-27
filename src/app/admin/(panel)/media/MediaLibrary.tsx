"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteMedia, updateAlt } from "@/app/actions/admin/media";
import { Icon } from "@/components/admin/Icon";
import { DropZone, UploadProgressList, useUploads } from "@/components/admin/ImageFields";
import { mediaUrl, thumbUrl, type MediaRef } from "@/content/images";
import { formatBytes } from "@/lib/admin/compress";
import styles from "@/components/admin/admin.module.css";

export type LibraryItem = {
  ref: MediaRef;
  name: string;
  bytes: number;
  format: "webp" | "jpg";
  created: string;
  usage: { label: string; href: string }[];
};

type Filter = "all" | "used" | "unused";
const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function MediaLibrary({ items, totalBytes }: { items: LibraryItem[]; totalBytes: number }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const uploads = useUploads(() => router.refresh());

  const counts = useMemo(
    () => ({ all: items.length, used: items.filter((i) => i.usage.length).length, unused: items.filter((i) => !i.usage.length).length }),
    [items],
  );
  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      (filter === "all" || (filter === "used" ? i.usage.length > 0 : i.usage.length === 0)) &&
      (!q || i.name.toLowerCase().includes(q) || i.ref.alt.toLowerCase().includes(q)),
  );
  const current = items.find((i) => i.ref.id === openId) ?? null;

  return (
    <>
      <section className={styles.card}>
        <DropZone multiple onFiles={(files) => uploads.start(files)} />
        <UploadProgressList jobs={uploads.jobs} />
      </section>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="group" aria-label="Show">
          {(["all", "used", "unused"] as const).map((f) => (
            <button key={f} type="button" className={styles.tab} aria-current={filter === f || undefined} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "used" ? "In use" : "Not used"} <span className={styles.tabCount}>{counts[f]}</span>
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
          {items.length} photos · {formatBytes(totalBytes)} stored
        </span>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>{items.length ? "No photos match." : "No photos uploaded yet. Drop some above to start."}</div>
      ) : (
        <ul className={styles.images}>
          {shown.map((i) => (
            <li key={i.ref.id} className={styles.imageCard}>
              <button type="button" className={styles.pick} onClick={() => setOpenId(i.ref.id)} aria-label={`Details for ${i.name || "photo"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl(i.ref, 300)} alt="" loading="lazy" style={{ backgroundImage: `url(${i.ref.blur})` }} />
                <span className={styles.pickName}>{i.ref.alt || i.name}</span>
              </button>
              <span className={styles.mediaMeta}>
                {i.usage.length ? <span className={styles.usedTag}>In use · {i.usage.length}</span> : <span className={styles.muted}>Not used</span>}
                <span className={styles.muted}>{formatBytes(i.bytes)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {current ? <Details key={current.ref.id} item={current} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

function Details({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [alt, setAlt] = useState(item.ref.alt);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const largest = item.ref.sizes[item.ref.sizes.length - 1];
  const url = mediaUrl(item.ref.id, largest, item.ref.ext);

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
        <img className={styles.detailPhoto} src={thumbUrl(item.ref, 960)} alt="" style={{ backgroundImage: `url(${item.ref.blur})` }} />
        <div className={styles.fields}>
          <dl className={styles.dl}>
            <div>
              <dt>Size</dt>
              <dd>
                {item.ref.w} × {item.ref.h}px · {formatBytes(item.bytes)} for {item.ref.sizes.length} sizes ({item.format.toUpperCase()})
              </dd>
            </div>
            <div>
              <dt>Uploaded</dt>
              <dd>{date.format(new Date(item.created))}</dd>
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
          <label className={styles.field}>
            <span className={styles.label}>Description (alt text)</span>
            <span className={styles.help}>What the photo shows, for people using screen readers. Applies where the photo is used next.</span>
            <textarea className={styles.textarea} value={alt} maxLength={300} rows={3} onChange={(e) => setAlt(e.target.value)} />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={pending || alt === item.ref.alt}
              onClick={() =>
                start(async () => {
                  const r = await updateAlt(item.ref.id, alt);
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
          <div className={styles.dangerZone}>
            {item.usage.length ? (
              <p className={`${styles.small} ${styles.muted}`}>To delete this photo, remove it from the places above first.</p>
            ) : confirming ? (
              <div className={styles.actions}>
                <span className={styles.small}>Delete this photo and all its sizes for good?</span>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await deleteMedia(item.ref.id);
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
        </div>
      </div>
    </dialog>
  );
}
