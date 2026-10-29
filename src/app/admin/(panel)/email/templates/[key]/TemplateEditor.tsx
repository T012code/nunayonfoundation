"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetTemplate, saveTemplate } from "@/app/actions/admin/email-templates";
import { sendTestEmail } from "@/app/actions/admin/email";
import { SaveBar } from "@/components/admin/fields";
import { TestSend } from "@/components/admin/TestSend";
import { EMAILS, renderEmail, SAMPLE_DETAILS, type TemplateFields, type TemplateKey } from "@/lib/email-templates";
import styles from "@/components/admin/admin.module.css";

const FIELDS: { key: keyof TemplateFields; label: string; help?: string; long?: boolean }[] = [
  { key: "subject", label: "Subject" },
  { key: "preheader", label: "Preview line", help: "Shown next to the subject in most inboxes." },
  { key: "heading", label: "Heading" },
  {
    key: "body",
    label: "Message",
    help: "Leave a blank line between paragraphs. **bold**, [words](https://…) for a link, “- ” at the start of a line for a list.",
    long: true,
  },
  { key: "button", label: "Button text" },
  { key: "note", label: "Small print", help: "Shown in smaller grey text at the end.", long: true },
];

export function TemplateEditor({
  templateKey,
  value,
  enabled: initialEnabled,
  edited,
  me,
}: {
  templateKey: TemplateKey;
  value: TemplateFields;
  enabled: boolean;
  edited: boolean;
  me: string;
}) {
  const def = EMAILS[templateKey];
  const router = useRouter();
  const [state, action, pending] = useActionState(saveTemplate.bind(null, templateKey), null);
  const [fields, setFields] = useState(value);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, start] = useTransition();
  const [resetNote, setResetNote] = useState<string | null>(null);
  const words = Object.keys(def.vars);

  const preview = useMemo(() => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return renderEmail(templateKey, fields, def.vars, {
      siteUrl: origin,
      link: origin,
      details: "hasDetails" in def ? SAMPLE_DETAILS : undefined,
      calloutTitle: templateKey === "forward" ? "Note from Layo" : undefined,
      calloutText: templateKey === "forward" ? "Could you reply to this one? Thanks." : undefined,
    });
  }, [templateKey, fields, def]);

  const visible = FIELDS.filter((f) => f.key !== "button" || def.hasButton);

  return (
    <form action={action} className={styles.form}>
      <div className={styles.editorSplit}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Wording</h2>
          <div className={styles.fields}>
            {"optional" in def ? (
              <label className={styles.check}>
                <input type="checkbox" name="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <span className={styles.checkText}>
                  Send this email
                  <span className={`${styles.small} ${styles.muted}`}> Turn off to stop these replies; the form still works.</span>
                </span>
              </label>
            ) : null}
            {words.length ? (
              <p className={`${styles.small} ${styles.muted}`}>
                Filled in when it&apos;s sent: {words.map((w) => <code key={w} className={styles.word}>{`{${w}}`}</code>)}
              </p>
            ) : null}
            {visible.map((f) => (
              <label key={f.key} className={styles.field}>
                <span className={styles.label}>{f.label}</span>
                {f.help ? <span className={styles.help}>{f.help}</span> : null}
                {f.long ? (
                  <textarea
                    className={styles.textarea}
                    name={f.key}
                    rows={f.key === "body" ? 8 : 3}
                    value={fields[f.key]}
                    onChange={(e) => setFields((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={styles.input}
                    name={f.key}
                    value={fields[f.key]}
                    onChange={(e) => setFields((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
            {!def.hasButton ? <input type="hidden" name="button" value="" /> : null}
            {"hasDetails" in def ? (
              <p className={`${styles.small} ${styles.muted}`}>The form&apos;s answers are added under the message automatically.</p>
            ) : null}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Preview</h2>
          <p className={styles.cardLead}>
            <strong>{preview.subject}</strong> · with sample details. Updates as you type.
          </p>
          <div className={styles.preview}>
            <iframe srcDoc={preview.html} title="Email preview" sandbox="" />
          </div>
          <TestSend defaultTo={me} send={(to) => sendTestEmail(to, templateKey)} />
          <p className={`${styles.small} ${styles.muted}`}>Tests use the saved wording, so save your changes first.</p>
        </section>
      </div>

      <SaveBar pending={pending} state={state}>
        {edited || resetNote ? (
          confirmReset ? (
            <>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={busy}
                onClick={() =>
                  start(async () => {
                    const r = await resetTemplate(templateKey);
                    setResetNote(r.ok ? (r.message ?? "") : r.error);
                    if (r.ok) {
                      setFields(def.defaults);
                      setEnabled(true);
                      router.refresh();
                    }
                    setConfirmReset(false);
                  })
                }
              >
                Yes, use the original wording
              </button>
              <button type="button" className={styles.ghostButton} onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className={styles.ghostButton} onClick={() => setConfirmReset(true)}>
              Reset to original
            </button>
          )
        ) : null}
        {resetNote ? (
          <span className={styles.status} data-tone="ok" role="status">
            {resetNote}
          </span>
        ) : null}
      </SaveBar>
    </form>
  );
}
