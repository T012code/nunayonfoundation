"use server";

import { redirect } from "next/navigation";
import { ActionError, requireAction } from "@/lib/admin/access";
import { KINDS, type Submission } from "@/lib/admin/inbox";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { addressList, sendTemplate } from "@/lib/mail";

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
    const kind = KINDS[item.kind];
    const from = access.name || access.email;
    const details = [
      { label: "Name", value: item.name },
      { label: "Email", value: item.email },
      ...(item.phone ? [{ label: "Phone", value: item.phone }] : []),
      { label: "Received", value: new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }) },
      ...item.fields,
    ];
    const sent = await sendTemplate("forward", to.join(", "), { form: kind, name: item.name, shared_by: from }, {
      details,
      replyTo: item.email,
      calloutTitle: `Note from ${from}`,
      calloutText: note || undefined,
    });
    if (!sent) throw new ActionError("Email isn't set up yet. Connect a mailbox in Email set-up first.");
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
