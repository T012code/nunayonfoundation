import "server-only";
import nodemailer from "nodemailer";
import { SITE_URL } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/server";

// Outgoing email through the foundation's own mailbox (Gmail, Microsoft 365 or Zoho), set up
// by the super admin in Settings → Email. The password is kept in Supabase Vault.

export const SMTP_PRESETS = {
  gmail: { host: "smtp.gmail.com", port: 465, secure: true, label: "Gmail / Google Workspace" },
  microsoft365: { host: "smtp.office365.com", port: 587, secure: false, label: "Microsoft 365 / Outlook" },
  zoho: { host: "smtp.zoho.com", port: 465, secure: true, label: "Zoho Mail" },
  other: { host: "", port: 465, secure: true, label: "Other provider" },
} as const;

export type MailSettings = {
  provider: keyof typeof SMTP_PRESETS;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  has_password: boolean;
};

type Mailer = { send: (msg: Message) => Promise<void>; from: string; close: () => void };
export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

/** A connected mailer, or null when email isn't set up yet (or the server key is missing). */
export async function getMailer(opts: { pool?: boolean } = {}): Promise<Mailer | null> {
  const db = serviceClient();
  if (!db) return null;
  const [{ data: s }, { data: password }] = await Promise.all([
    db.from("mail_settings").select("*").maybeSingle<MailSettings>(),
    db.rpc("get_smtp_password"),
  ]);
  if (!s?.host || !s.username || !password) return null;
  const transport = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    requireTLS: !s.secure,
    auth: { user: s.username, pass: password as string },
    pool: opts.pool,
    maxConnections: opts.pool ? 2 : undefined,
  });
  const fromEmail = s.from_email || s.username;
  const from = `"${s.from_name.replace(/"/g, "")}" <${fromEmail}>`;
  return {
    from,
    close: () => transport.close(),
    async send(msg) {
      await transport.sendMail({
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        replyTo: msg.replyTo ?? (s.reply_to || undefined),
        headers: msg.headers,
      });
    },
  };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The branded email frame. Email clients don't support modern CSS colour functions, so the
 * brand colours are written here as plain hex values (teal, leaf, cream, ink).
 */
export function layout({ preheader = "", body, footer }: { preheader?: string; body: string; footer?: string }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f7f1e6;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;color:#0f2f33;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e6;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="padding:0 8px 20px;">
<a href="${SITE_URL}" style="text-decoration:none;color:#0f2f33;font-weight:800;font-size:22px;letter-spacing:-0.02em;">nunayon <span style="color:#2f8a57;">foundation</span></a>
</td></tr>
<tr><td style="background:#ffffff;border-radius:16px;padding:32px 28px;font-size:16px;line-height:1.65;">
${body}
</td></tr>
<tr><td style="padding:20px 8px;font-size:12px;line-height:1.6;color:#5b6b6c;">
${footer ?? `Nunayon Foundation · Lagos, Nigeria · <a href="${SITE_URL}" style="color:#5b6b6c;">nunayonfoundation.org</a>`}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function button(href: string, label: string) {
  return `<p style="margin:28px 0 8px;"><a href="${esc(href)}" style="display:inline-block;background:#00393e;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px;">${esc(label)}</a></p>`;
}

/** Plain text to email-safe HTML paragraphs (blank lines separate paragraphs). */
export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export { esc as escapeHtml };
