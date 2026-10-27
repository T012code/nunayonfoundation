import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/env";
import { getSettings } from "@/lib/content";
import { getMailer } from "@/lib/mail";
import { formatBody, formatBodyText, letterhead, type Letterhead } from "@/lib/newsletter-template";

// Newsletter sending. A campaign is sent by queueing one row per confirmed subscriber, then
// working through the queue in small batches (from the admin page while it's open, or from
// the scheduler every few minutes), so no single request runs long and the mailbox's daily
// limit is respected.

export type Campaign = {
  id: string;
  subject: string;
  preheader: string;
  body: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  scheduled_at: string | null;
  started_at: string | null;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
};

/** Contact details for the letterhead footer, from Site settings. */
export async function getLetterhead(): Promise<Letterhead> {
  const s = await getSettings();
  return { siteUrl: SITE_URL, address: s.address, phone: s.phone, email: s.email, socials: s.socials };
}

export function renderCampaign(c: Pick<Campaign, "subject" | "preheader" | "body">, head: Letterhead, token?: string) {
  const unsubscribe = token ? `${SITE_URL}/newsletter/unsubscribe?token=${token}` : `${SITE_URL}/newsletter/unsubscribe`;
  const html = letterhead({ head, subject: c.subject, preheader: c.preheader, bodyHtml: formatBody(c.body), unsubscribe });
  const text = `${c.subject}\n\n${formatBodyText(c.body)}\n\nWith gratitude,\nThe Nunayon Foundation team\n\n—\nUnsubscribe: ${unsubscribe}`;
  return { html, text, unsubscribe };
}

/** Queues every confirmed subscriber and marks the campaign as sending. */
export async function startCampaign(db: SupabaseClient, id: string) {
  const { data: c } = await db.from("campaigns").select("status").eq("id", id).maybeSingle();
  if (!c || c.status === "sent" || c.status === "sending") return;
  const { data: subs } = await db.from("subscribers").select("id").eq("status", "confirmed");
  const rows = (subs ?? []).map((s) => ({ campaign_id: id, subscriber_id: s.id as string }));
  for (let i = 0; i < rows.length; i += 500) {
    await db.from("campaign_recipients").upsert(rows.slice(i, i + 500), { onConflict: "campaign_id,subscriber_id", ignoreDuplicates: true });
  }
  await db.from("campaigns").update({ status: "sending", started_at: new Date().toISOString() }).eq("id", id);
}

/** Sends the next batch. Returns how many are left in the queue. */
export async function sendBatch(db: SupabaseClient, id: string, { limit = 20, deadline = Date.now() + 40_000 } = {}) {
  const { data: c } = await db.from("campaigns").select("*").eq("id", id).maybeSingle<Campaign>();
  if (!c || c.status !== "sending") return { remaining: 0, sent: 0, failed: 0 };
  const { data: queue } = await db
    .from("campaign_recipients")
    .select("subscriber_id, subscribers(email, token, status)")
    .eq("campaign_id", id)
    .eq("status", "queued")
    .limit(limit);
  const items = (queue ?? []) as unknown as { subscriber_id: string; subscribers: { email: string; token: string; status: string } | null }[];

  let sent = 0;
  let failed = 0;
  if (items.length) {
    const head = await getLetterhead();
    const mailer = await getMailer({ pool: true });
    if (!mailer) throw new Error("Email isn't set up. Connect a mailbox in Email set-up first.");
    try {
      for (const item of items) {
        if (Date.now() > deadline) break;
        const sub = item.subscribers;
        const done = (status: "sent" | "failed", error = "") =>
          db
            .from("campaign_recipients")
            .update({ status, error: error.slice(0, 300), sent_at: new Date().toISOString() })
            .eq("campaign_id", id)
            .eq("subscriber_id", item.subscriber_id);
        // Someone who unsubscribed after the campaign was queued is skipped.
        if (!sub || sub.status !== "confirmed") {
          await done("failed", "Unsubscribed before sending");
          failed++;
          continue;
        }
        const { html, text, unsubscribe } = renderCampaign(c, head, sub.token);
        try {
          await mailer.send({
            to: sub.email,
            subject: c.subject,
            html,
            text,
            headers: {
              "List-Unsubscribe": `<${SITE_URL}/api/newsletter/unsubscribe?token=${sub.token}>, <${unsubscribe}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
          await done("sent");
          sent++;
        } catch (err) {
          await done("failed", err instanceof Error ? err.message : String(err));
          failed++;
        }
      }
    } finally {
      mailer.close();
    }
  }

  const [{ count: remaining }, { count: sentTotal }, { count: failedTotal }] = await Promise.all([
    db.from("campaign_recipients").select("*", { count: "exact", head: true }).eq("campaign_id", id).eq("status", "queued"),
    db.from("campaign_recipients").select("*", { count: "exact", head: true }).eq("campaign_id", id).eq("status", "sent"),
    db.from("campaign_recipients").select("*", { count: "exact", head: true }).eq("campaign_id", id).eq("status", "failed"),
  ]);
  await db
    .from("campaigns")
    .update({
      sent_count: sentTotal ?? 0,
      failed_count: failedTotal ?? 0,
      ...(remaining ? {} : { status: "sent", sent_at: new Date().toISOString() }),
    })
    .eq("id", id);
  return { remaining: remaining ?? 0, sent, failed };
}

/** For the scheduler: start campaigns whose time has come, then keep sending. */
export async function runScheduled(db: SupabaseClient, budgetMs = 50_000) {
  const deadline = Date.now() + budgetMs;
  const { data: due } = await db.from("campaigns").select("id").eq("status", "scheduled").lte("scheduled_at", new Date().toISOString());
  for (const c of due ?? []) await startCampaign(db, c.id);
  const { data: active } = await db.from("campaigns").select("id").eq("status", "sending").order("started_at");
  let total = 0;
  for (const c of active ?? []) {
    while (Date.now() < deadline) {
      const r = await sendBatch(db, c.id, { limit: 25, deadline });
      total += r.sent + r.failed;
      if (!r.remaining || r.sent + r.failed === 0) break;
    }
  }
  return total;
}
