"use server";

import { redirect } from "next/navigation";
import { ActionError, requireAction } from "@/lib/admin/access";
import { KINDS, type Submission } from "@/lib/admin/inbox";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { addressList, detailRows, escapeHtml, getMailer, layout } from "@/lib/mail";

export async function setStatus(id: string, status: "new" | "read" | "archived") {
  return run(async () => {
    const { supabase } = await requireAction("inbox");
    check(await supabase.from("submissions").update({ status }).eq("id", id), "update");
    return { ok: true, message: status === "archived" ? "Archived" : status === "new" ? "Marked as new" : "Marked as read" };
  });
}

export async function deleteSubmission(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("inbox");
    check(await supabase.from("submissions").delete().eq("id", id), "delete");
  });
  if (result.ok) redirect("/admin/inbox");
  return result;
}

/**
 * Sends a message from the inbox to a team member or any address, in the site's email
 * letterhead, with an optional note. Replies go straight to the person who wrote in.
 */
export async function forwardSubmission(id: string, _: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase, access } = await requireAction("inbox");
    const to = addressList(String(fd.get("to") ?? ""));
    if (!to.length) throw new ActionError("Choose a team member or type an email address.");
    if (to.length > 10) throw new ActionError("Send to at most 10 addresses at a time.");
    const note = String(fd.get("note") ?? "").trim().slice(0, 2000);
    const { data } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
    if (!data) throw new ActionError("That message is no longer in the inbox.");
    const item = data as Submission;
    const mailer = await getMailer();
    if (!mailer) throw new ActionError("Email isn't set up yet. Connect a mailbox in Email set-up first.");
    const kind = KINDS[item.kind];
    const from = access.name || access.email;
    const rows = [
      { label: "Name", value: item.name },
      { label: "Email", value: item.email },
      ...(item.phone ? [{ label: "Phone", value: item.phone }] : []),
      ...item.fields,
    ];
    try {
      await mailer.send({
        to: to.join(", "),
        replyTo: item.email,
        subject: `${kind} from ${item.name}`,
        text:
          (note ? `${from} wrote: ${note}\n\n` : `${from} shared this with you.\n\n`) +
          rows.map((r) => `${r.label}: ${r.value}`).join("\n\n") +
          `\n\nReply to this email to answer ${item.name} directly.`,
        html: layout({
          kicker: "Website inbox",
          preheader: `${kind} from ${item.name}, shared by ${from}`,
          body:
            `<h1 style="margin:0 0 8px;font-size:22px;">${escapeHtml(kind)} from ${escapeHtml(item.name)}</h1>` +
            `<p style="margin:0 0 20px;font-size:14px;color:#5b6b6c;">Shared by ${escapeHtml(from)} · received ${escapeHtml(new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }))}</p>` +
            (note
              ? `<div style="margin:0 0 24px;padding:14px 16px;border:1px solid #cfe9d8;background:#eef8f1;border-radius:10px;"><p style="margin:0 0 4px;font-size:13px;color:#2f8a57;font-weight:600;">Note from ${escapeHtml(from)}</p><p style="margin:0;white-space:pre-wrap;">${escapeHtml(note)}</p></div>`
              : "") +
            detailRows(rows) +
            `<p style="margin:12px 0 0;font-size:13px;color:#5b6b6c;">Reply to this email to answer ${escapeHtml(item.name)} directly.</p>`,
        }),
      });
    } finally {
      mailer.close();
    }
    await supabase.from("activity_log").insert({
      actor: (await supabase.auth.getClaims()).data?.claims.sub,
      actor_email: access.email,
      action: "forwarded",
      entity: "submissions",
      entity_id: id,
      summary: `${item.name} → ${to.join(", ")}`,
    });
    return { ok: true, message: `Sent to ${to.join(", ")}` };
  });
}
