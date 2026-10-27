"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { continueSending, deleteCampaign, saveCampaign, schedule, sendNow, sendTest } from "@/app/actions/admin/newsletter";
import { SaveBar, TextArea, TextInput } from "@/components/admin/fields";
import { formatTime } from "@/components/admin/ui";
import type { Campaign } from "@/lib/newsletter";
import styles from "@/components/admin/admin.module.css";

export function CampaignForm({
  campaign,
  subscribers,
  justSaved,
  preview,
}: {
  campaign: Campaign | null;
  subscribers: number;
  justSaved?: boolean;
  /** The email as subscribers will see it. */
  preview: string | null;
}) {
  const router = useRouter();
  const id = campaign?.id ?? null;
  const editable = !campaign || campaign.status === "draft" || campaign.status === "scheduled";
  const [state, action, pending] = useActionState(saveCampaign.bind(null, id), justSaved ? { ok: true as const, message: "Draft saved" } : null);
  const [busy, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [when, setWhen] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const sending = useRef(false);

  const report = (r: { ok: boolean; message?: string; error?: string }) => setNote({ ok: r.ok, text: (r.ok ? r.message : r.error) ?? "" });

  // While a campaign is sending and this page is open, keep working through the queue.
  useEffect(() => {
    if (campaign?.status !== "sending" || !id || sending.current) return;
    sending.current = true;
    let stop = false;
    (async () => {
      while (!stop) {
        const r = await continueSending(id);
        router.refresh();
        if (!r.ok) {
          report(r);
          break;
        }
        if (!r.remaining) break;
      }
      sending.current = false;
    })();
    return () => {
      stop = true;
    };
  }, [campaign?.status, id, router]);

  // After each save, fetch the page again so the preview shows the saved version.
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  const total = (campaign?.sent_count ?? 0) + (campaign?.failed_count ?? 0);

  return (
    <div className={styles.form}>
      {campaign && !editable ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{campaign.status === "sent" ? "Sent" : "Sending…"}</h2>
          <p>
            {campaign.sent_count} delivered{campaign.failed_count ? `, ${campaign.failed_count} couldn't be sent` : ""}
            {campaign.status === "sent" ? ` · finished ${formatTime(campaign.sent_at)}` : ""}.
          </p>
          {campaign.status === "sending" ? (
            <>
              <div className={styles.progress} aria-hidden="true">
                <span style={{ transform: `scaleX(${subscribers ? Math.min(1, total / subscribers) : 0})` }} />
              </div>
              <p className={`${styles.small} ${styles.muted}`}>Keep this page open to send faster. If you close it, the scheduler carries on every few minutes.</p>
            </>
          ) : null}
        </section>
      ) : null}

      {editable ? (
        <form action={action} className={styles.form}>
          <section className={styles.card}>
            <div className={styles.fields}>
              <TextInput name="subject" label="Subject" required defaultValue={campaign?.subject} maxLength={150} />
              <TextInput
                name="preheader"
                label="Preview line"
                defaultValue={campaign?.preheader}
                maxLength={150}
                help="Shown after the subject in most inboxes."
              />
              <TextArea
                name="body"
                label="Message"
                required
                tall
                defaultValue={campaign?.body}
                help="Leave a blank line between paragraphs. Start a line with ## for a heading, wrap words in **double stars** for bold. Links become clickable."
              />
            </div>
          </section>
          <SaveBar pending={pending} state={state} label="Save draft">
            {id ? (
              <button type="button" className={styles.ghostButton} disabled={busy} onClick={() => start(async () => void (await deleteCampaign(id)))}>
                Delete draft
              </button>
            ) : null}
          </SaveBar>
        </form>
      ) : null}

      {preview ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Preview</h2>
          <div className={styles.preview}>
            <iframe srcDoc={preview} title="Email preview" sandbox="" />
          </div>
        </section>
      ) : null}

      {id && editable ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Send</h2>
          <p className={styles.cardLead}>
            Goes to {subscribers} confirmed subscriber{subscribers === 1 ? "" : "s"}. Save any changes first, then send yourself a test.
          </p>
          <div className={styles.fields}>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => start(async () => report(await sendTest(id)))}>
                Send me a test
              </button>
              {confirmSend ? (
                <>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={busy}
                    onClick={() =>
                      start(async () => {
                        const r = await sendNow(id);
                        report(r);
                        setConfirmSend(false);
                        router.refresh();
                      })
                    }
                  >
                    Yes, send to {subscribers}
                  </button>
                  <button type="button" className={styles.ghostButton} onClick={() => setConfirmSend(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className={styles.primaryButton} disabled={busy || !subscribers} onClick={() => setConfirmSend(true)}>
                  Send now
                </button>
              )}
            </div>
            {campaign?.status === "scheduled" ? (
              <div className={styles.actions}>
                <span>Scheduled for {formatTime(campaign.scheduled_at)}.</span>
                <button
                  type="button"
                  className={styles.ghostButton}
                  disabled={busy}
                  onClick={() =>
                    start(async () => {
                      report(await schedule(id, null));
                      router.refresh();
                    })
                  }
                >
                  Cancel schedule
                </button>
              </div>
            ) : (
              <div className={styles.actions}>
                <label className={styles.field}>
                  <span className={styles.label}>Or schedule it</span>
                  <input className={styles.input} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
                </label>
                <button
                  type="button"
                  className={`${styles.secondaryButton} ${styles.alignEnd}`}
                  disabled={busy || !when}
                  onClick={() =>
                    start(async () => {
                      report(await schedule(id, new Date(when).toISOString()));
                      router.refresh();
                    })
                  }
                >
                  Schedule
                </button>
              </div>
            )}
            {note ? (
              <p className={styles.status} data-tone={note.ok ? "ok" : "error"} role="status">
                {note.text}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
