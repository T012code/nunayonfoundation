// The newsletter letterhead and the message format, shared by the admin's live preview and the
// server that sends. No server-only imports, so the preview is exactly what subscribers get.
//
// Message format (what the toolbar writes):
//   blank line            new paragraph
//   ## Heading            heading (### for a smaller one)
//   - item                bullet list (1. item for a numbered list)
//   **bold**  _italic_    emphasis
//   [words](https://…)    link; plain addresses become links too
//   ![description](url)   photo, on a line of its own
//   [button: Donate](url) button, on a line of its own
//   ---                   divider

export type Letterhead = {
  siteUrl: string;
  address: string;
  phone: string;
  email: string;
  socials: { label: string; href: string }[];
};

const C = {
  teal: "#00393e",
  leaf: "#2f8a57",
  mint: "#8fd3a8",
  cream: "#f7f1e6",
  ink: "#0f2f33",
  muted: "#5b6b6c",
  rule: "#e6ddcc",
};
const FONT = "Montserrat,Segoe UI,Helvetica,Arial,sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (u: string) => (/^(https?:\/\/|mailto:)/i.test(u.trim()) ? u.trim() : null);

const LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const BARE = /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)]/g;

/** One line of text: links, bold and italic; everything else escaped. */
function inline(raw: string) {
  const tokens: string[] = [];
  const hold = (html: string) => `\u0000${tokens.push(html) - 1}\u0000`;
  let s = raw.replace(LINK, (m, text: string, url: string) => {
    const u = safeUrl(url);
    return u ? hold(`<a href="${esc(u)}" style="color:${C.leaf};font-weight:600;">${esc(text)}</a>`) : m;
  });
  s = s.replace(BARE, (url) => hold(`<a href="${esc(url)}" style="color:${C.leaf};font-weight:600;">${esc(url.replace(/^https?:\/\//, ""))}</a>`));
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^\s_](?:[^_]*[^\s_])?)_(?=$|[\s).,;:!?])/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)]);
}

const P = `margin:0 0 18px;font-size:16px;line-height:1.7;color:${C.ink};`;

/** The message as email-safe HTML. */
export function formatBody(body: string) {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (/^-{3,}$/.test(block)) return `<hr style="border:0;border-top:1px solid ${C.rule};margin:28px 0;">`;
      if (block.startsWith("### ")) return `<h3 style="margin:26px 0 10px;font-size:17px;line-height:1.35;color:${C.ink};">${inline(block.slice(4))}</h3>`;
      if (block.startsWith("## ")) return `<h2 style="margin:30px 0 12px;font-size:21px;line-height:1.3;letter-spacing:-0.01em;color:${C.ink};">${inline(block.slice(3))}</h2>`;
      const img = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (img && safeUrl(img[2])) {
        return `<p style="margin:8px 0 22px;"><img src="${esc(img[2])}" alt="${esc(img[1])}" width="544" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:12px;"></p>`;
      }
      const btn = block.match(/^\[button:\s*([^\]]+)\]\(([^)\s]+)\)$/i);
      if (btn && safeUrl(btn[2])) {
        return `<p style="margin:26px 0;"><a href="${esc(btn[2])}" style="display:inline-block;background:${C.teal};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:999px;">${esc(btn[1].trim())}</a></p>`;
      }
      if (lines.every((l) => /^[-*] /.test(l))) {
        return `<ul style="margin:0 0 18px;padding-left:22px;">${lines.map((l) => `<li style="${P}margin:0 0 6px;">${inline(l.slice(2))}</li>`).join("")}</ul>`;
      }
      if (lines.every((l) => /^\d+[.)] /.test(l))) {
        return `<ol style="margin:0 0 18px;padding-left:22px;">${lines.map((l) => `<li style="${P}margin:0 0 6px;">${inline(l.replace(/^\d+[.)] /, ""))}</li>`).join("")}</ol>`;
      }
      return `<p style="${P}">${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}

/** The same message as plain text, for mail apps that don't show HTML. */
export function formatBodyText(body: string) {
  return body
    .replace(/^!\[([^\]]*)\]\(([^)\s]+)\)$/gm, "[Photo: $1]")
    .replace(/^\[button:\s*([^\]]+)\]\(([^)\s]+)\)$/gim, "$1: $2")
    .replace(LINK, "$1 ($2)")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{2,3} /gm, "")
    .replace(/^-{3,}$/gm, "———");
}

/**
 * The letterhead: a teal band with the logo and a leaf-green line, the message on white,
 * a sign-off, and a footer with the foundation's contact details, social links and the
 * unsubscribe link.
 */
export function letterhead({
  head,
  subject,
  preheader,
  bodyHtml,
  unsubscribe,
}: {
  head: Letterhead;
  subject: string;
  preheader: string;
  bodyHtml: string;
  unsubscribe: string;
}) {
  const site = head.siteUrl;
  const contact = [head.address, head.phone, head.email ? `<a href="mailto:${esc(head.email)}" style="color:${C.muted};">${esc(head.email)}</a>` : ""]
    .filter(Boolean)
    .map((x) => (x.startsWith("<a") ? x : esc(x)))
    .join(" &nbsp;·&nbsp; ");
  const socials = head.socials
    .filter((s) => safeUrl(s.href))
    .map((s) => `<a href="${esc(s.href)}" style="color:${C.teal};font-weight:600;text-decoration:none;">${esc(s.label)}</a>`)
    .join(" &nbsp;·&nbsp; ");
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};font-family:${FONT};color:${C.ink};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
<tr><td style="background:${C.teal};padding:26px 28px 22px;">
<a href="${esc(site)}" style="text-decoration:none;"><img src="${esc(site)}/email/logo-stacked-reversed.png" width="150" height="50" alt="Nunayon Foundation" style="display:block;width:150px;height:auto;border:0;color:#ffffff;font-size:20px;font-weight:800;"></a>
<p style="margin:14px 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${C.mint};font-weight:600;">News from the field</p>
</td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:${C.leaf};">&nbsp;</td></tr>
<tr><td style="padding:34px 28px 8px;">
<h1 style="margin:0 0 22px;font-size:26px;line-height:1.25;letter-spacing:-0.015em;color:${C.ink};">${esc(subject)}</h1>
${bodyHtml}
<p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:${C.ink};">With gratitude,<br><strong>The Nunayon Foundation team</strong></p>
</td></tr>
<tr><td style="padding:26px 28px 30px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.rule};"><tr><td style="padding-top:20px;font-size:13px;line-height:1.7;color:${C.muted};">
${socials ? `<p style="margin:0 0 10px;">${socials}</p>` : ""}
${contact ? `<p style="margin:0 0 10px;">${contact}</p>` : ""}
<p style="margin:0;"><a href="${esc(unsubscribe)}" style="color:${C.muted};">Unsubscribe</a></p>
</td></tr></table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
