"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { getMailer, layout, button, escapeHtml } from "@/lib/mail";
import { SITE_URL } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

export type FormResult = { ok: true } | { ok: false; error: string };

type Kind = "contact" | "partner" | "volunteer" | "donation";
type FieldSpec = { name: string; label: string; required?: boolean; max?: number; multi?: boolean };

// What each form sends, in the order the team should read it. Anything else is ignored.
const FORMS: Record<Kind, { subject: string; fields: FieldSpec[] }> = {
  contact: {
    subject: "New message",
    fields: [
      { name: "topic", label: "Topic", required: true, max: 60 },
      { name: "message", label: "Message", required: true, max: 5000 },
    ],
  },
  partner: {
    subject: "New partnership enquiry",
    fields: [
      { name: "organisation", label: "Organisation", required: true, max: 200 },
      { name: "message", label: "How they'd like to partner", required: true, max: 5000 },
    ],
  },
  volunteer: {
    subject: "New volunteer sign-up",
    fields: [
      { name: "state", label: "State", required: true, max: 60 },
      { name: "interests", label: "Would like to help with", required: true, multi: true, max: 400 },
      { name: "availability", label: "Usually free", required: true, multi: true, max: 200 },
      { name: "about", label: "Anything else", max: 3000 },
    ],
  },
  donation: {
    subject: "Donation notice",
    fields: [
      { name: "amount", label: "Amount (₦)", required: true, max: 20 },
      { name: "date", label: "Date of transfer", required: true, max: 60 },
      { name: "programme", label: "For", required: true, max: 200 },
      { name: "note", label: "Note", max: 2000 },
    ],
  },
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNAVAILABLE =
  "Sorry, we couldn't send your form just now. Please try again in a few minutes, or email us directly.";

const text = (fd: FormData, name: string, max = 200) => String(fd.get(name) ?? "").trim().slice(0, max);

async function passesBotChecks(fd: FormData) {
  // Real people never see or fill the honeypot field.
  if (text(fd, "website")) return false;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return verifyTurnstile(String(fd.get("cf-turnstile-response") ?? "") || null, ip);
}

/** Saves a contact, partnership, volunteer or donation form to the inbox and alerts the team. */
export async function submitForm(kind: Kind, fd: FormData): Promise<FormResult> {
  const spec = FORMS[kind];
  if (!spec) return { ok: false, error: UNAVAILABLE };
  if (!(await passesBotChecks(fd))) {
    return { ok: false, error: "We couldn't confirm you're not a robot. Please try again." };
  }

  const name = text(fd, "name", 120);
  const email = text(fd, "email", 200).toLowerCase();
  const phone = text(fd, "phone", 30);
  if (!name || !EMAIL.test(email)) return { ok: false, error: "Please check your name and email address." };

  const fields: { label: string; value: string }[] = [];
  for (const f of spec.fields) {
    const value = f.multi
      ? fd.getAll(f.name).map(String).map((v) => v.trim()).filter(Boolean).join(", ").slice(0, f.max)
      : text(fd, f.name, f.max);
    if (f.required && !value) return { ok: false, error: `Please fill in "${f.label}".` };
    if (value) fields.push({ label: f.label, value });
  }

  const db = serviceClient();
  if (!db) {
    console.error("[forms] SUPABASE_SECRET_KEY is not set; submission not saved");
    return { ok: false, error: UNAVAILABLE };
  }
  const { error } = await db.from("submissions").insert({ kind, name, email, phone, fields });
  if (error) {
    console.error("[forms] insert failed", error);
    return { ok: false, error: UNAVAILABLE };
  }

  // Email the team after the visitor has their answer, so a slow mail server never delays it.
  after(async () => {
    try {
      const [mailer, { data: settings }] = await Promise.all([
        getMailer(),
        db.from("site_settings").select("notify_email").maybeSingle<{ notify_email: string }>(),
      ]);
      if (!mailer || !settings?.notify_email) return;
      const rows = [{ label: "Name", value: name }, { label: "Email", value: email }, ...(phone ? [{ label: "Phone", value: phone }] : []), ...fields];
      await mailer.send({
        to: settings.notify_email,
        replyTo: email,
        subject: `${spec.subject} from ${name}`,
        text: rows.map((r) => `${r.label}: ${r.value}`).join("\n\n") + `\n\nOpen the inbox: ${SITE_URL}/admin/inbox`,
        html: layout({
          preheader: `${spec.subject} from ${name}`,
          body:
            `<h1 style="margin:0 0 20px;font-size:22px;">${escapeHtml(spec.subject)}</h1>` +
            rows
              .map(
                (r) =>
                  `<p style="margin:0 0 4px;font-size:13px;color:#5b6b6c;">${escapeHtml(r.label)}</p><p style="margin:0 0 16px;white-space:pre-wrap;">${escapeHtml(r.value)}</p>`,
              )
              .join("") +
            button(`${SITE_URL}/admin/inbox`, "Open the inbox") +
            `<p style="margin:12px 0 0;font-size:13px;color:#5b6b6c;">Reply to this email to answer ${escapeHtml(name)} directly.</p>`,
        }),
      });
      mailer.close();
    } catch (err) {
      console.error("[forms] alert email failed", err);
    }
  });

  return { ok: true };
}

/**
 * Newsletter sign-up with double opt-in: the address is saved as pending and a confirmation
 * link is emailed. The answer is the same whether or not the address is already on the list.
 */
export async function subscribe(fd: FormData): Promise<FormResult> {
  if (text(fd, "website")) return { ok: true };
  const email = text(fd, "email", 200).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: "Enter a valid email address, like name@example.com." };

  const db = serviceClient();
  if (!db) return { ok: false, error: UNAVAILABLE };

  const { data: existing } = await db
    .from("subscribers")
    .select("id, status, token, created_at")
    .eq("email", email)
    .maybeSingle<{ id: string; status: string; token: string; created_at: string }>();

  let token = existing?.token;
  if (!existing) {
    const { data, error } = await db.from("subscribers").insert({ email }).select("token").single<{ token: string }>();
    if (error) return { ok: false, error: UNAVAILABLE };
    token = data.token;
  } else if (existing.status === "confirmed") {
    return { ok: true };
  } else if (existing.status === "unsubscribed") {
    await db.from("subscribers").update({ status: "pending", unsubscribed_at: null }).eq("id", existing.id);
  }

  after(async () => {
    try {
      await sendConfirmation(email, token!);
    } catch (err) {
      console.error("[newsletter] confirmation email failed", err);
    }
  });
  return { ok: true };
}

async function sendConfirmation(email: string, token: string) {
  const mailer = await getMailer();
  if (!mailer) return;
  const url = `${SITE_URL}/newsletter/confirm?token=${token}`;
  await mailer.send({
    to: email,
    subject: "Please confirm your subscription",
    text: `Thank you for signing up to news from Nunayon Foundation.\n\nConfirm your subscription: ${url}\n\nIf you didn't sign up, ignore this email and you won't hear from us.`,
    html: layout({
      preheader: "One click to confirm, and you'll get our stories from the field.",
      body:
        `<h1 style="margin:0 0 16px;font-size:22px;">Confirm your subscription</h1>` +
        `<p style="margin:0 0 16px;">Thank you for signing up to news from Nunayon Foundation. We write a few times a year about our outreaches and the families we meet.</p>` +
        button(url, "Yes, subscribe me") +
        `<p style="margin:16px 0 0;font-size:13px;color:#5b6b6c;">If you didn't sign up, ignore this email and you won't hear from us.</p>`,
    }),
  });
  mailer.close();
}
