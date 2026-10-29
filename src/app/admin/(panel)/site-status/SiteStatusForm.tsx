"use client";

import { useActionState, useState } from "react";
import { saveSiteStatus } from "@/app/actions/admin/site-status";
import { SaveBar } from "@/components/admin/fields";
import { Icon } from "@/components/admin/Icon";
import { MODE_DEFAULTS, type SiteMode } from "@/content/site-mode";
import styles from "@/components/admin/admin.module.css";

export type SiteStatusValues = { site_mode: SiteMode; mode_title: string; mode_message: string; mode_until: string };

const MODES: { value: SiteMode; label: string; text: string }[] = [
  { value: "live", label: "Live", text: "Everyone sees the full website." },
  { value: "maintenance", label: "Maintenance", text: "A “back shortly” page, with ways to contact you." },
  { value: "coming_soon", label: "Coming soon", text: "A launch page with newsletter sign-up." },
];

export function SiteStatusForm({ values }: { values: SiteStatusValues }) {
  const [state, action, pending] = useActionState(saveSiteStatus, null);
  const [mode, setMode] = useState<SiteMode>(values.site_mode);
  const [text, setText] = useState({ title: values.mode_title, message: values.mode_message, until: values.mode_until });
  const edit = (k: keyof typeof text) => (e: { target: { value: string } }) => setText((t) => ({ ...t, [k]: e.target.value }));
  const previewHref = `/site-preview?${new URLSearchParams({ mode: mode === "live" ? "maintenance" : mode, ...text })}`;
  const d = mode === "live" ? null : MODE_DEFAULTS[mode];

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>What visitors see</h2>
        <div className={styles.modeGrid} role="radiogroup" aria-label="Site status">
          {MODES.map((m) => (
            <label key={m.value} className={styles.modeTile}>
              <input type="radio" name="site_mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} />
              <strong>{m.label}</strong>
              <span className={`${styles.small} ${styles.muted}`}>{m.text}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.card} hidden={!d}>
        <h2 className={styles.cardTitle}>The message</h2>
        <p className={styles.cardLead}>Leave a box empty to use the suggested wording shown in it.</p>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Heading</span>
            <input className={styles.input} name="mode_title" value={text.title} onChange={edit("title")} maxLength={140} placeholder={d?.title} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Message</span>
            <textarea className={styles.textarea} name="mode_message" value={text.message} onChange={edit("message")} maxLength={600} rows={3} placeholder={d?.message} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{mode === "coming_soon" ? "Opening (optional)" : "Back by (optional)"}</span>
            <span className={styles.help}>Any wording, e.g. “4pm today” or “Monday 3 November”.</span>
            <input className={styles.input} name="mode_until" value={text.until} onChange={edit("until")} maxLength={80} />
          </label>
          <div>
            <a href={previewHref} target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              Preview this page <Icon name="external" />
            </a>
          </div>
        </div>
      </section>

      <SaveBar pending={pending} state={state} label={mode === "live" ? "Save" : "Save and switch on"} />
    </form>
  );
}
