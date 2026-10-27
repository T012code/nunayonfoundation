"use server";

import { redirect } from "next/navigation";
import { ActionError, requireAction } from "@/lib/admin/access";
import { required, str } from "@/lib/admin/form";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { button, getMailer, layout } from "@/lib/mail";
import { SITE_URL } from "@/lib/env";
import { renderCampaign, sendBatch, startCampaign } from "@/lib/newsletter";
import { serviceClient } from "@/lib/supabase/server";

function needService() {
  const db = serviceClient();
  if (!db) throw new ActionError("Add SUPABASE_SECRET_KEY in Vercel first: sending needs the server key.");
  return db;
}

export async function saveCampaign(id: string | null, _: unknown, fd: FormData): Promise<ActionResult> {
  let created: string | null = null;
  const result = await run(async () => {
    const { supabase } = await requireAction("newsletter");
    const row = { subject: required(fd, "subject", "Subject", 150), preheader: str(fd, "preheader", 150), body: required(fd, "body", "Message", 30000) };
    if (id) check(await supabase.from("campaigns").update(row).eq("id", id), "save the newsletter (it may already be sending)");
    else {
      const { data } = check(await supabase.from("campaigns").insert(row).select("id").single());
      created = (data as { id: string }).id;
    }
    return { ok: true, message: "Draft saved" };
  });
  if (created) redirect(`/admin/newsletter/${created}?saved=1`);
  return result;
}

export async function sendTest(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase, access } = await requireAction("newsletter");
    const { data: c } = await supabase.from("campaigns").select("subject, preheader, body").eq("id", id).maybeSingle();
    if (!c) throw new ActionError("Save the newsletter first.");
    const mailer = await getMailer();
    if (!mailer) throw new ActionError("Email isn't set up yet. The super admin can connect a mailbox in Email set-up.");
    const { html, text } = renderCampaign(c);
    await mailer.send({ to: access.email, subject: `[Test] ${c.subject}`, html, text });
    mailer.close();
    return { ok: true, message: `Test sent to ${access.email}` };
  });
}

export async function schedule(id: string, when: string | null): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("newsletter");
    if (when) {
      const at = new Date(when);
      if (Number.isNaN(at.getTime()) || at.getTime() < Date.now() + 60_000) throw new ActionError("Choose a time at least a minute from now.");
      check(await supabase.from("campaigns").update({ status: "scheduled", scheduled_at: at.toISOString() }).eq("id", id), "schedule");
      return { ok: true, message: "Scheduled" };
    }
    check(await supabase.from("campaigns").update({ status: "draft", scheduled_at: null }).eq("id", id), "unschedule");
    return { ok: true, message: "Back to draft" };
  });
}

/** Queues every confirmed subscriber. The page then calls continueSending until done. */
export async function sendNow(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase, access } = await requireAction("newsletter");
    const db = needService();
    if (!(await getMailer())) throw new ActionError("Email isn't set up yet. The super admin can connect a mailbox in Email set-up.");
    const { count } = await db.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed");
    if (!count) throw new ActionError("There are no confirmed subscribers yet.");
    await startCampaign(db, id);
    const { data: c } = await db.from("campaigns").select("subject").eq("id", id).maybeSingle();
    await supabase.from("activity_log").insert({ actor: (await supabase.auth.getClaims()).data?.claims.sub, actor_email: access.email, action: "started sending", entity: "campaigns", entity_id: id, summary: c?.subject ?? "" });
    return { ok: true, message: `Sending to ${count} subscriber${count === 1 ? "" : "s"}…` };
  });
}

export async function continueSending(id: string): Promise<ActionResult & { remaining?: number }> {
  let remaining = 0;
  const result = await run(async () => {
    await requireAction("newsletter");
    const r = await sendBatch(needService(), id, { limit: 15, deadline: Date.now() + 25_000 });
    remaining = r.remaining;
  });
  return { ...result, remaining };
}

export async function deleteCampaign(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("newsletter");
    check(await supabase.from("campaigns").delete().eq("id", id), "delete (only drafts can be deleted)");
  });
  if (result.ok) redirect("/admin/newsletter");
  return result;
}

export async function removeSubscriber(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("newsletter");
    check(await supabase.from("subscribers").delete().eq("id", id), "remove");
    return { ok: true, message: "Removed" };
  });
}

/** Re-sends the confirmation email to everyone who signed up but hasn't confirmed. */
export async function resendConfirmations(): Promise<ActionResult> {
  return run(async () => {
    await requireAction("newsletter");
    const db = needService();
    const mailer = await getMailer({ pool: true });
    if (!mailer) throw new ActionError("Email isn't set up yet.");
    const { data } = await db.from("subscribers").select("email, token").eq("status", "pending").limit(200);
    let n = 0;
    try {
      for (const s of data ?? []) {
        const url = `${SITE_URL}/newsletter/confirm?token=${s.token}`;
        await mailer.send({
          to: s.email,
          subject: "Please confirm your subscription",
          text: `Confirm your subscription to news from Nunayon Foundation: ${url}`,
          html: layout({
            preheader: "One click to confirm.",
            body: `<h1 style="margin:0 0 16px;font-size:22px;">Confirm your subscription</h1><p style="margin:0 0 16px;">You signed up for news from Nunayon Foundation. Please confirm it's you.</p>${button(url, "Yes, subscribe me")}`,
          }),
        });
        n++;
      }
    } finally {
      mailer.close();
    }
    return { ok: true, message: `Sent ${n} confirmation email${n === 1 ? "" : "s"}` };
  });
}
