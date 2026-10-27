"use client";

import { useEffect, useRef, useState } from "react";
import { BUILTIN_IMAGES, builtinInfo, thumbUrl, type ImageRef } from "@/content/images";
import { createClient } from "@/lib/supabase/browser";
import { Icon } from "./Icon";
import styles from "./admin.module.css";

type Row = {
  id: string;
  width: number;
  height: number;
  sizes: number[];
  blur: string;
  alt: string;
  format: "webp" | "jpg";
  name: string;
};

// Each choice: an upload (its row) or a photo built into the site (its name).
type Choice = { key: string; ref: ImageRef; label: string; blur: string; builtin: boolean };

const builtins: Choice[] = BUILTIN_IMAGES.map((slug) => {
  const info = builtinInfo(slug);
  return { key: slug, ref: slug, label: info.alt, blur: info.blur, builtin: true };
});

/** Picks photos already in the media library: uploads first, then the built-in photos. */
export function MediaDialog({
  open,
  multiple,
  onClose,
  onPick,
}: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onPick: (refs: ImageRef[]) => void;
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
  const uploads: Choice[] = (rows ?? []).map((r) => ({
    key: r.id,
    ref: { id: r.id, w: r.width, h: r.height, sizes: r.sizes, blur: r.blur, alt: r.alt, ext: r.format },
    label: r.alt || r.name,
    blur: r.blur,
    builtin: false,
  }));
  const all = [...uploads, ...builtins];
  const shown = all.filter((c) => !q || c.label.toLowerCase().includes(q) || c.key.toLowerCase().includes(q));

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
        placeholder="Search by name or description"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search photos"
      />
      <div className={styles.dialogBody}>
        {rows === null ? (
          <p className={styles.muted}>Loading photos…</p>
        ) : shown.length === 0 ? (
          <p className={styles.muted}>No photos match.</p>
        ) : (
          <>
            {[
              { title: "Uploaded", list: shown.filter((c) => !c.builtin) },
              { title: "Built into the site", list: shown.filter((c) => c.builtin) },
            ]
              .filter((g) => g.list.length)
              .map((g) => (
                <section key={g.title} className={styles.pickGroup}>
                  <h3 className={styles.pickGroupTitle}>{g.title}</h3>
                  <div className={styles.images}>
                    {g.list.map((c) => {
                      const on = chosen.includes(c.key);
                      return (
                        <button
                          key={c.key}
                          type="button"
                          className={styles.pick}
                          aria-pressed={on}
                          onClick={() =>
                            multiple
                              ? setChosen((list) => (on ? list.filter((x) => x !== c.key) : [...list, c.key]))
                              : (onPick([c.ref]), ref.current?.close())
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl(c.ref, 300)}
                            alt=""
                            loading="lazy"
                            style={{ backgroundImage: `url(${c.blur})` }}
                          />
                          <span className={styles.pickName}>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
          </>
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
              onPick(chosen.map((key) => all.find((c) => c.key === key)!.ref));
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
