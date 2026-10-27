"use server";

import { ActionError, requireAction } from "@/lib/admin/access";
import { str } from "@/lib/admin/form";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { getMailer, layout, SMTP_PRESETS } from "@/lib/mail";
import { emailProblem } from "@/lib/validate";

export async function saveMailSettings(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    const provider = str(fd, "provider", 20) as keyof typeof SMTP_PRESETS;
    if (!(provider in SMTP_PRESETS)) throw new ActionError("Choose your email provider.");
    const preset = SMTP_PRESETS[provider];
    const host = provider === "other" ? str(fd, "host", 200) : preset.host;
    const port = provider === "other" ? Number(str(fd, "port", 6)) || 465 : preset.port;
    const username = str(fd, "username", 200);
    const fromEmail = str(fd, "from_email", 200) || username;
    for (const [label, v] of [["Sign-in email", username], ["Send from", fromEmail], ["Replies go to", str(fd, "reply_to", 200)]] as const) {
      const problem = v ? emailProblem(v) : null;
      if (problem) throw new ActionError(`${label}: ${problem}`);
    }
    if (!host) throw new ActionError("Add the SMTP server.");
    check(
      await supabase
        .from("mail_settings")
        .update({
          provider,
          host,
          port,
          secure: provider === "other" ? port === 465 : preset.secure,
          username,
          from_name: str(fd, "from_name", 100) || "Nunayon Foundation",
          from_email: fromEmail,
          reply_to: str(fd, "reply_to", 200),
        })
        .eq("id", true),
    );
    const password = String(fd.get("password") ?? "");
    if (password) check(await supabase.rpc("set_smtp_password", { new_password: password.replace(/\s/g, "") }), "save the password");
    return { ok: true, message: "Saved. Send a test email to check it works." };
  });
}

export async function sendTestEmail(): Promise<ActionResult> {
  return run(async () => {
    const { access } = await requireAction("manage");
    const mailer = await getMailer();
    if (!mailer) throw new ActionError("Email isn't fully set up yet: save the details and password first (and make sure the server key is added in Vercel).");
    try {
      await mailer.send({
        to: access.email,
        subject: "Test email from the Nunayon Foundation website",
        text: "It works. Form alerts, invitations and newsletters will be sent from this mailbox.",
        html: layout({ body: `<h1 style="margin:0 0 16px;font-size:22px;">It works</h1><p style="margin:0;">Form alerts, invitations and newsletters will be sent from this mailbox.</p>` }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ActionError(
        /auth|535|534|credentials/i.test(msg)
          ? "The mailbox refused the sign-in. Check the email and app password (not your normal password)."
          : `Sending failed: ${msg}`,
      );
    } finally {
      mailer.close();
    }
    return { ok: true, message: `Test email sent to ${access.email}. Check the inbox (and spam folder).` };
  });
}
