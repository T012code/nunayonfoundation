"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAccess } from "@/lib/admin/access";
import { getMailer, logEmail, sendTemplate } from "@/lib/mail";
import { SITE_URL } from "@/lib/env";
import { createClient, serviceClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Records a sign-in (or MFA) event in the activity log, in the team member's own name. */
export async function logSignIn(action: "signed in" | "verified MFA" | "set up MFA" | "replaced MFA") {
  const s = await getAccess();
  if (s.state === "signed-out" || s.state === "no-access") return;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const h = await headers();
  await supabase.from("activity_log").insert({
    actor: data?.claims.sub,
    actor_email: s.access.email,
    action,
    entity: "session",
    summary: h.get("user-agent")?.slice(0, 160) ?? "",
  });
}

/**
 * Sends a password reset link. Uses the foundation's mailbox when set up, otherwise
 * Supabase's built-in email. Always answers the same way, so it can't reveal who has an account.
 */
export async function requestReset(_: unknown, fd: FormData): Promise<{ done: boolean; error?: string }> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { done: false, error: "Enter your email address." };
  const db = serviceClient();
  try {
    if (db) {
      const { data: admin } = await db.from("admins").select("id, name").eq("email", email).eq("active", true).maybeSingle<{ id: string; name: string }>();
      if (!admin) return { done: true };
      const mailer = await getMailer();
      if (mailer) {
        const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email });
        if (error || !data) return { done: true };
        const url = `${SITE_URL}/admin/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/admin/set-password`;
        try {
          await sendTemplate("password_reset", email, { name: admin.name.split(" ")[0] || "there" }, { link: url, mailer });
        } finally {
          mailer.close();
        }
        return { done: true };
      }
    }
    // No mailbox connected yet: Supabase's own (unbranded) email sends the link.
    await logEmail({ kind: "password_reset", to: email, subject: "Reset password (sent by Supabase)" });
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/admin/auth/confirm?next=/admin/set-password`,
    });
  } catch (err) {
    console.error("[auth] reset failed", err);
  }
  return { done: true };
}

export async function setPassword(_: unknown, fd: FormData): Promise<{ error?: string }> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (password.length < 12) return { error: "Use at least 12 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/admin");
}
