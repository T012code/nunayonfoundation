"use server";

import { revalidatePath } from "next/cache";
import { ActionError, requireAction } from "@/lib/admin/access";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { getMailer } from "@/lib/mail";

type LogRow = { kind: string; to_address: string; subject: string; html: string; text_body: string; reply_to: string };

/** Sends a logged email again, exactly as it was, to the same people. */
export async function resendEmail(id: number): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    const { data } = await supabase.from("email_log").select("kind, to_address, subject, html, text_body, reply_to").eq("id", id).maybeSingle<LogRow>();
    if (!data) throw new ActionError("That email is no longer in the log.");
    if (!data.html && !data.text_body) throw new ActionError("This entry was logged without its content, so it can't be resent.");
    const mailer = await getMailer();
    if (!mailer) throw new ActionError("Email isn't set up yet. Connect a mailbox under Email → Set-up.");
    try {
      await mailer.send({
        kind: data.kind,
        to: data.to_address,
        subject: data.subject,
        html: data.html,
        text: data.text_body,
        replyTo: data.reply_to || undefined,
      });
    } catch (err) {
      throw new ActionError(`Sending failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      mailer.close();
    }
    revalidatePath("/admin/email/log");
    return { ok: true, message: `Sent again to ${data.to_address}` };
  });
}

/** Removes entries from the log (one, a selection, or all). */
export async function deleteEmailLog(ids: number[] | "all"): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    const q = supabase.from("email_log").delete();
    check(ids === "all" ? await q.gt("id", 0) : await q.in("id", ids.slice(0, 500)), "delete");
    revalidatePath("/admin/email/log");
    return { ok: true, message: ids === "all" ? "Log cleared" : ids.length === 1 ? "Deleted" : `Deleted ${ids.length}` };
  });
}
