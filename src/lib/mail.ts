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
 * The branded email frame, matching the newsletter letterhead: a teal band with the logo and
 * a leaf-green line, the message on white, and a short footer. Email clients don't support
 * modern CSS colour functions, so the brand colours are plain hex values here.
 */
export function layout({
  preheader = "",
  body,
  footer,
  kicker = "",
}: {
  preheader?: string;
  body: string;
  footer?: string;
  /** Small line under the logo, e.g. "Website inbox". */
  kicker?: string;
}) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f7f1e6;font-family:Montserrat,Segoe UI,Helvetica,Arial,sans-serif;color:#0f2f33;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e6;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
<tr><td style="background:#00393e;padding:24px 28px 20px;">
<a href="${SITE_URL}" style="text-decoration:none;"><img src="${SITE_URL}/email/logo-stacked-reversed.png" width="150" height="50" alt="Nunayon Foundation" style="display:block;width:150px;height:auto;border:0;color:#ffffff;font-size:20px;font-weight:800;"></a>
${kicker ? `<p style="margin:12px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8fd3a8;font-weight:600;">${esc(kicker)}</p>` : ""}
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:#2f8a57;">&nbsp;</td></tr>
<tr><td style="padding:32px 28px 28px;font-size:16px;line-height:1.65;">
${body}
</td></tr>
<tr><td style="padding:0 28px 26px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6ddcc;"><tr><td style="padding-top:18px;font-size:12px;line-height:1.6;color:#5b6b6c;">
${footer ?? `Nunayon Foundation · <a href="${SITE_URL}" style="color:#5b6b6c;">${SITE_URL.replace(/^https?:\/\//, "")}</a>`}
</td></tr></table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** A submission's details as label / value rows, for alerts and forwards. */
export function detailRows(rows: { label: string; value: string }[]) {
  return rows
    .map(
      (r) =>
        `<p style="margin:0 0 4px;font-size:13px;color:#5b6b6c;">${esc(r.label)}</p><p style="margin:0 0 16px;white-space:pre-wrap;">${esc(r.value)}</p>`,
    )
    .join("");
}

/** Comma- or line-separated addresses into a clean list. */
export function addressList(value: string) {
  return [...new Set(value.split(/[\s,;]+/).map((a) => a.trim().toLowerCase()).filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a)))];
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
