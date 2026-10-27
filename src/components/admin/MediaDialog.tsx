"use client";

import { useEffect, useRef, useState } from "react";
import { thumbUrl, type MediaRef } from "@/content/images";
import { createClient } from "@/lib/supabase/browser";
import { Icon } from "./Icon";
import styles from "./admin.module.css";

type Row = { id: string; width: number; height: number; sizes: number[]; blur: string; alt: string; format: "webp" | "jpg"; name: string };

/** Picks photos already in the media library. */
export function MediaDialog({
  open,
  multiple,
  onClose,
  onPick,
}: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onPick: (refs: MediaRef[]) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      createClient()
        .from("media")
        .select("id, width, height, sizes, blur, alt, format, name")
        .order("created_at", { ascending: false })
        .limit(300)
        .then(({ data }) => setRows((data as Row[]) ?? []));
    }
    if (!open && d.open) d.close();
  }, [open]);

  const q = query.trim().toLowerCase();
  const shown = (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q) || r.alt.toLowerCase().includes(q));
  const toRef = (r: Row): MediaRef => ({ id: r.id, w: r.width, h: r.height, sizes: r.sizes, blur: r.blur, alt: r.alt, ext: r.format });

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={() => {
        setChosen([]);
        onClose();
      }}
      aria-labelledby="media-dialog-title"
    >
      <div className={styles.dialogHead}>
        <h2 id="media-dialog-title" className={styles.cardTitle}>
          Choose from the media library
        </h2>
        <button type="button" className={styles.iconButton} onClick={() => ref.current?.close()} aria-label="Close">
          <Icon name="close" />
        </button>
      </div>
      <input
        type="search"
        className={styles.input}
        placeholder="Search by file name or description"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search photos"
      />
      <div className={styles.dialogBody}>
        {rows === null ? (
          <p className={styles.muted}>Loading photos…</p>
        ) : shown.length === 0 ? (
          <p className={styles.muted}>No photos yet. Upload one instead.</p>
        ) : (
          <div className={styles.images}>
            {shown.map((r) => {
              const on = chosen.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  className={styles.pick}
                  aria-pressed={on}
                  onClick={() =>
                    multiple ? setChosen((c) => (on ? c.filter((x) => x !== r.id) : [...c, r.id])) : (onPick([toRef(r)]), ref.current?.close())
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl(toRef(r), 300)} alt="" loading="lazy" style={{ backgroundImage: `url(${r.blur})` }} />
                  <span className={styles.pickName}>{r.alt || r.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {multiple ? (
        <div className={styles.dialogFoot}>
          <span className={styles.muted}>{chosen.length} selected</span>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={!chosen.length}
            onClick={() => {
              onPick(chosen.map((id) => toRef((rows ?? []).find((r) => r.id === id)!)));
              ref.current?.close();
            }}
          >
            Add {chosen.length || ""} photo{chosen.length === 1 ? "" : "s"}
          </button>
        </div>
      ) : null}
    </dialog>
  );
}
