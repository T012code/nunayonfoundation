import "server-only";
import nodemailer from "nodemailer";
import {
  button,
  detailRows,
  escapeHtml,
  layout as frame,
  mergeTemplate,
  renderEmail,
  type RenderExtras,
  type TemplateFields,
  type TemplateKey,
} from "@/lib/email-templates";
import { SITE_URL } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/server";

// Outgoing email through the foundation's own mailbox (Gmail, Microsoft 365 or Zoho), set up
// by a manager in Admin → Email. The password is kept in Supabase Vault.

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

export type Mailer = { send: (msg: Message) => Promise<void>; from: string; close: () => void };
export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
  /** What the email is, for the email log. Newsletter broadcasts ("newsletter") aren't logged here. */
  kind?: string;
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
      const log = msg.kind !== "newsletter";
      const entry = { kind: msg.kind ?? "other", to: msg.to, subject: msg.subject, html: msg.html, text: msg.text, replyTo: msg.replyTo };
      try {
        await transport.sendMail({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          replyTo: msg.replyTo ?? (s.reply_to || undefined),
          headers: msg.headers,
        });
      } catch (err) {
        if (log) await logEmail({ ...entry, error: err instanceof Error ? err.message : String(err) });
        throw err;
      }
      if (log) await logEmail(entry);
    },
  };
}

/** The branded frame with this site's address filled in. */
export function layout(opts: Omit<Parameters<typeof frame>[0], "siteUrl">) {
  return frame({ siteUrl: SITE_URL, ...opts });
}

/** Plain text to email-safe HTML paragraphs (blank lines separate paragraphs). */
export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/** Comma- or line-separated addresses into a clean list. */
export function addressList(value: string) {
  return [...new Set(value.split(/[\s,;]+/).map((a) => a.trim().toLowerCase()).filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a)))];
}

export { button, detailRows, escapeHtml };

/** One email's saved wording, with the built-in text wherever nothing is saved. */
export async function getTemplate(key: TemplateKey) {
  const db = serviceClient();
  const { data } = db
    ? await db.from("email_templates").select("*").eq("key", key).maybeSingle<TemplateFields & { enabled: boolean }>()
    : { data: null };
  return { ...mergeTemplate(key, data), enabled: data?.enabled ?? true };
}

/**
 * Sends one of the site's emails (Admin → Email → Templates) with its current wording.
 * Returns false when email isn't set up yet. Throws if the mailbox refuses it.
 */
export async function sendTemplate(
  key: TemplateKey,
  to: string,
  vars: Record<string, string>,
  extras: Omit<RenderExtras, "siteUrl"> & { replyTo?: string; subjectPrefix?: string; mailer?: Mailer } = {},
) {
  const tpl = await getTemplate(key);
  // Autoresponders that have been switched off (test sends still go out).
  if (!tpl.enabled && !extras.subjectPrefix) return false;
  const mailer = extras.mailer ?? (await getMailer());
  if (!mailer) return false;
  const { subject, html, text } = renderEmail(key, tpl, vars, { siteUrl: SITE_URL, ...extras });
  try {
    await mailer.send({ to, subject: (extras.subjectPrefix ?? "") + subject, html, text, replyTo: extras.replyTo, kind: key });
  } finally {
    if (!extras.mailer) mailer.close();
  }
  return true;
}

/** Notes a send in the email log (Admin → Email → Log). Never fails the send itself. */
export async function logEmail(entry: { kind: string; to: string; subject: string; error?: string; html?: string; text?: string; replyTo?: string }) {
  try {
    await serviceClient()
      ?.from("email_log")
      .insert({
        kind: entry.kind,
        to_address: entry.to.slice(0, 500),
        subject: entry.subject.slice(0, 300),
        status: entry.error ? "failed" : "sent",
        error: (entry.error ?? "").slice(0, 500),
        html: entry.html ?? "",
        text_body: entry.text ?? "",
        reply_to: entry.replyTo ?? "",
      });
  } catch (err) {
    console.error("[mail] couldn't write the email log", err);
  }
}
