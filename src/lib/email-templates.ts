// The site's emails: the branded frame, the built-in wording of each email, and how a saved
// template becomes the finished message. No server-only imports, so the admin's live preview
// renders exactly what people receive.
//
// Wording is edited in Admin → Email → Templates. Words in {curly brackets} are filled in when
// the email is sent. The text fields use the newsletter's message format (blank line for a new
// paragraph, **bold**, [words](https://…) for a link, "- " for a list).

import { formatBody, formatBodyText } from "@/lib/newsletter-template";

export const GROUPS = ["Replies to visitors", "Team alerts", "Admin sign-in", "Newsletter", "Other"] as const;

export type TemplateFields = {
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  button: string;
  note: string;
};

export type TemplateKey = keyof typeof EMAILS;

type Definition = {
  label: string;
  /** Who gets it and when, shown in the admin. */
  when: string;
  /** Small line under the logo. */
  kicker: string;
  /** The {words} this email can use, with sample values for the preview and test sends. */
  vars: Record<string, string>;
  /** Shows a button (the link is filled in when sending). */
  hasButton: boolean;
  /** The submitted form's details are added under the text. */
  hasDetails?: boolean;
  /** An autoresponder: can be switched off in the admin. */
  optional?: boolean;
  group: "Replies to visitors" | "Team alerts" | "Admin sign-in" | "Newsletter" | "Other";
  defaults: TemplateFields;
};

export const EMAILS = {
  reply_contact: {
    group: "Replies to visitors",
    label: "Reply: contact form",
    when: "Sent straight away to someone who uses the contact form.",
    kicker: "",
    vars: { name: "Chidi" },
    hasButton: true,
    hasDetails: true,
    optional: true,
    defaults: {
      subject: "We've got your message",
      preheader: "Thank you for writing to Nunayon Foundation.",
      heading: "Thank you, {name}",
      body: "We've received your message and someone from the team will reply within two working days.\n\nHere's a copy of what you sent, for your records.",
      button: "Visit our website",
      note: "You're getting this because you used the contact form on our website. If that wasn't you, you can ignore this email.",
    },
  },
  reply_volunteer: {
    group: "Replies to visitors",
    label: "Reply: volunteer sign-up",
    when: "Sent straight away to someone who signs up to volunteer.",
    kicker: "",
    vars: { name: "Chidi" },
    hasButton: true,
    hasDetails: true,
    optional: true,
    defaults: {
      subject: "Thank you for offering to volunteer",
      preheader: "We'll be in touch about the next outreach near you.",
      heading: "Thank you, {name}",
      body: "Thank you for offering your time. We'll contact you before our next outreach near you, usually by phone or WhatsApp.\n\nHere's what you told us, for your records.",
      button: "See our programmes",
      note: "You're getting this because you signed up on our website. If that wasn't you, you can ignore this email.",
    },
  },
  reply_partner: {
    group: "Replies to visitors",
    label: "Reply: partnership enquiry",
    when: "Sent straight away to an organisation that asks about partnering.",
    kicker: "",
    vars: { name: "Chidi" },
    hasButton: true,
    hasDetails: true,
    optional: true,
    defaults: {
      subject: "Thank you for your partnership enquiry",
      preheader: "We'll reply within two working days.",
      heading: "Thank you, {name}",
      body: "We're glad you'd like to work with us. Someone from the team will reply within two working days to arrange a conversation.\n\nHere's a copy of your enquiry.",
      button: "Visit our website",
      note: "You're getting this because you used the partnership form on our website.",
    },
  },
  reply_donation: {
    group: "Replies to visitors",
    label: "Reply: donation notice",
    when: "Sent straight away to someone who tells us they've made a transfer.",
    kicker: "",
    vars: { name: "Chidi" },
    hasButton: true,
    hasDetails: true,
    optional: true,
    defaults: {
      subject: "Thank you for your gift",
      preheader: "We'll confirm once your transfer arrives.",
      heading: "Thank you, {name}",
      body: "Thank you for supporting our work. We'll check our account and confirm once your transfer has arrived.\n\nHere are the details you gave us.",
      button: "See where gifts go",
      note: "If anything here is wrong, reply to this email and we'll sort it out.",
    },
  },
  password_reset: {
    group: "Admin sign-in",
    label: "Forgot password",
    when: "A team member asks for a password reset on the sign-in page.",
    kicker: "Admin",
    vars: { name: "Ada" },
    hasButton: true,
    defaults: {
      subject: "Reset your admin password",
      preheader: "Choose a new password for the admin.",
      heading: "Reset your password",
      body: "Hello {name}, someone asked to reset the password for your Nunayon Foundation admin account.",
      button: "Choose a new password",
      note: "The link works once and expires in an hour. If this wasn't you, ignore this email: your password stays the same.",
    },
  },
  invite: {
    group: "Admin sign-in",
    label: "Team invitation",
    when: "A manager adds someone to the team.",
    kicker: "Admin",
    vars: { name: "Ada", invited_by: "Layo" },
    hasButton: true,
    defaults: {
      subject: "You're invited to the Nunayon Foundation admin",
      preheader: "Choose a password to start.",
      heading: "You're invited",
      body: "Hello {name}, {invited_by} has added you to the Nunayon Foundation website admin, where we keep the site's news, photos and messages up to date.",
      button: "Choose your password",
      note: "The link works once. If it has expired, ask {invited_by} to send a new one.",
    },
  },
  password_link: {
    group: "Admin sign-in",
    label: "Password link from a manager",
    when: "A manager sends a team member a link to set a new password.",
    kicker: "Admin",
    vars: { name: "Ada", sent_by: "Layo" },
    hasButton: true,
    defaults: {
      subject: "Set your Nunayon Foundation admin password",
      preheader: "Choose a new password.",
      heading: "Set your password",
      body: "Hello {name}, {sent_by} sent you a link to set a new password for the admin.",
      button: "Choose your password",
      note: "The link works once. If it has expired, ask {sent_by} to send a new one.",
    },
  },
  newsletter_confirm: {
    group: "Newsletter",
    label: "Newsletter confirmation",
    when: "Someone signs up to the newsletter (they confirm before they're added).",
    kicker: "Newsletter",
    vars: {},
    hasButton: true,
    defaults: {
      subject: "Please confirm your subscription",
      preheader: "One click to confirm, and you'll get our stories from the field.",
      heading: "Confirm your subscription",
      body: "Thank you for signing up to news from Nunayon Foundation. We write a few times a year about our outreaches and the families we meet.",
      button: "Yes, subscribe me",
      note: "If you didn't sign up, ignore this email and you won't hear from us.",
    },
  },
  form_alert: {
    group: "Team alerts",
    label: "New message alert",
    when: "Someone sends a contact, volunteer or partnership form. Goes to the addresses in Settings → Form alerts.",
    kicker: "Website inbox",
    vars: { form: "Contact message", name: "Chidi Okafor" },
    hasButton: true,
    hasDetails: true,
    defaults: {
      subject: "{form} from {name}",
      preheader: "{form} from {name}",
      heading: "{form}",
      body: "",
      button: "Open the inbox",
      note: "Reply to this email to answer {name} directly.",
    },
  },
  forward: {
    group: "Team alerts",
    label: "Message shared from the inbox",
    when: "A team member forwards a message from the inbox.",
    kicker: "Website inbox",
    vars: { form: "Contact message", name: "Chidi Okafor", shared_by: "Layo" },
    hasButton: false,
    hasDetails: true,
    defaults: {
      subject: "{form} from {name}",
      preheader: "{form} from {name}, shared by {shared_by}",
      heading: "{form} from {name}",
      body: "{shared_by} shared this message from the website inbox with you.",
      button: "",
      note: "Reply to this email to answer {name} directly.",
    },
  },
  test: {
    group: "Other",
    label: "Test email",
    when: "Sent from Email set-up to check the mailbox works.",
    kicker: "",
    vars: {},
    hasButton: false,
    defaults: {
      subject: "Test email from the Nunayon Foundation website",
      preheader: "Your mailbox is connected.",
      heading: "It works",
      body: "Form alerts, invitations and newsletters will be sent from this mailbox.",
      button: "",
      note: "",
    },
  },
} satisfies Record<string, Definition>;

export const TEMPLATE_KEYS = Object.keys(EMAILS) as TemplateKey[];
export const FIELD_KEYS = ["subject", "preheader", "heading", "body", "button", "note"] as const;

export const isTemplateKey = (k: string): k is TemplateKey => k in EMAILS;

/** Saved wording over the built-in wording; empty saved fields use the built-in text. */
export function mergeTemplate(key: TemplateKey, saved?: Partial<TemplateFields> | null): TemplateFields {
  const d = EMAILS[key].defaults;
  const out = { ...d };
  for (const f of FIELD_KEYS) if (saved?.[f]?.trim()) out[f] = saved[f]!;
  return out;
}

/** Fills in {words}; unknown ones are left as they are so a typo is easy to spot. */
export function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export { esc as escapeHtml };

/**
 * The branded email frame, matching the newsletter letterhead: a teal band with the logo and
 * a leaf-green line, the message on white, and a short footer. Email clients don't support
 * modern CSS colour functions, so the brand colours are plain hex values here.
 */
export function layout({
  siteUrl,
  preheader = "",
  body,
  footer,
  kicker = "",
}: {
  siteUrl: string;
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
<a href="${siteUrl}" style="text-decoration:none;"><img src="${siteUrl}/email/logo-stacked-reversed.png" width="150" height="50" alt="Nunayon Foundation" style="display:block;width:150px;height:auto;border:0;color:#ffffff;font-size:20px;font-weight:800;"></a>
${kicker ? `<p style="margin:12px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8fd3a8;font-weight:600;">${esc(kicker)}</p>` : ""}
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:#2f8a57;">&nbsp;</td></tr>
<tr><td style="padding:32px 28px 28px;font-size:16px;line-height:1.65;">
${body}
</td></tr>
<tr><td style="padding:0 28px 26px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6ddcc;"><tr><td style="padding-top:18px;font-size:12px;line-height:1.6;color:#5b6b6c;">
${footer ?? `Nunayon Foundation · <a href="${siteUrl}" style="color:#5b6b6c;">${siteUrl.replace(/^https?:\/\//, "")}</a>`}
</td></tr></table>
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

/** A submission's details as label / value rows, for alerts and forwards. */
export function detailRows(rows: { label: string; value: string }[]) {
  return rows
    .map(
      (r) =>
        `<p style="margin:0 0 4px;font-size:13px;color:#5b6b6c;">${esc(r.label)}</p><p style="margin:0 0 16px;white-space:pre-wrap;">${esc(r.value)}</p>`,
    )
    .join("");
}

/** A tinted, fully outlined box, e.g. the note someone adds when forwarding a message. */
export function callout(title: string, text: string) {
  return `<div style="margin:0 0 24px;padding:14px 16px;border:1px solid #cfe9d8;background:#eef8f1;border-radius:10px;"><p style="margin:0 0 4px;font-size:13px;color:#2f8a57;font-weight:600;">${esc(title)}</p><p style="margin:0;white-space:pre-wrap;">${esc(text)}</p></div>`;
}

/** Sample details for previews and test sends of emails that carry a form's answers. */
export const SAMPLE_DETAILS = [
  { label: "Name", value: "Chidi Okafor" },
  { label: "Email", value: "chidi@example.com" },
  { label: "Topic", value: "General enquiry" },
  { label: "Message", value: "Hello, I'd like to know when your next outreach in Lagos is and how I can help." },
];

export type RenderExtras = {
  siteUrl: string;
  /** Where the button goes. */
  link?: string;
  details?: { label: string; value: string }[];
  /** Extra HTML (and text) above the details, e.g. a forwarding note. */
  calloutTitle?: string;
  calloutText?: string;
};

/** A template and its values as a finished email: subject, HTML and plain text. */
export function renderEmail(key: TemplateKey, tpl: TemplateFields, vars: Record<string, string>, extras: RenderExtras) {
  const def: Definition = EMAILS[key];
  const f = (s: string) => fill(s, vars);
  const subject = f(tpl.subject).trim() || def.defaults.subject;
  const heading = f(tpl.heading).trim();
  const body = f(tpl.body);
  const note = f(tpl.note).trim();
  const label = f(tpl.button).trim() || def.defaults.button;
  const link = def.hasButton && extras.link ? extras.link : "";

  const html = layout({
    siteUrl: extras.siteUrl,
    kicker: def.kicker,
    preheader: f(tpl.preheader),
    body:
      (heading ? `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${esc(heading)}</h1>` : "") +
      (body.trim() ? formatBody(body) : "") +
      (extras.calloutText ? callout(extras.calloutTitle ?? "Note", extras.calloutText) : "") +
      (extras.details?.length ? detailRows(extras.details) : "") +
      (link && label ? button(link, label) : "") +
      (note ? `<p style="margin:16px 0 0;font-size:13px;color:#5b6b6c;">${esc(note)}</p>` : ""),
  });

  const text = [
    heading,
    body.trim() ? formatBodyText(body) : "",
    extras.calloutText ? `${extras.calloutTitle ?? "Note"}: ${extras.calloutText}` : "",
    extras.details?.map((r) => `${r.label}: ${r.value}`).join("\n\n") ?? "",
    link ? `${label}: ${link}` : "",
    note,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, html, text };
}
