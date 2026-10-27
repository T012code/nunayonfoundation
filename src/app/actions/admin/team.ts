"use server";

import { redirect } from "next/navigation";
import { ActionError, PERMISSIONS, requireAction, type Permission, type Role } from "@/lib/admin/access";
import { required, str } from "@/lib/admin/form";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { button, getMailer, layout } from "@/lib/mail";
import { SITE_URL } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/server";
import { emailProblem } from "@/lib/validate";

const ROLES: Exclude<Role, "super_admin">[] = ["admin", "editor", "communications"];

function readPermissions(fd: FormData) {
  return fd.getAll("permissions").map(String).filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p));
}

function needService() {
  const db = serviceClient();
  if (!db) throw new ActionError("Add SUPABASE_SECRET_KEY in Vercel first: inviting people needs the server key.");
  return db;
}

/** A one-time link that signs the person in and asks them to choose a password. */
async function setupLink(email: string) {
  const db = needService();
  const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data) throw new ActionError(`Couldn't create a sign-in link: ${error?.message ?? "unknown error"}`);
  return `${SITE_URL}/admin/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/admin/set-password`;
}

async function emailLink(email: string, name: string, link: string, invitedBy: string, isInvite: boolean) {
  const mailer = await getMailer();
  if (!mailer) return false;
  const first = name.split(" ")[0] || "there";
  await mailer.send({
    to: email,
    subject: isInvite ? "You're invited to the Nunayon Foundation admin" : "Set your Nunayon Foundation admin password",
    text: `Hello ${first},\n\n${isInvite ? `${invitedBy} has added you to the Nunayon Foundation website admin.` : "Here is a link to set a new password for the admin."}\n\nChoose your password: ${link}\n\nThe link works once and expires in 24 hours.`,
    html: layout({
      preheader: isInvite ? "Choose a password to start." : "Choose a new password.",
      body:
        `<h1 style="margin:0 0 16px;font-size:22px;">${isInvite ? "You're invited" : "Set your password"}</h1>` +
        `<p style="margin:0 0 16px;">Hello ${first}, ${isInvite ? `${invitedBy} has added you to the Nunayon Foundation website admin.` : "here is a link to set a new password for the admin."}</p>` +
        button(link, "Choose your password") +
        `<p style="margin:16px 0 0;font-size:13px;color:#5b6b6c;">The link works once and expires in 24 hours.</p>`,
    }),
  });
  mailer.close();
  return true;
}

export type InviteResult = ActionResult & { link?: string };

export async function invite(_: unknown, fd: FormData): Promise<InviteResult> {
  let link: string | undefined;
  let emailed = false;
  let createdId: string | null = null;
  const result = await run(async () => {
    const { supabase, access } = await requireAction("super");
    const db = needService();
    const name = required(fd, "name", "Name", 120);
    const rawEmail = required(fd, "email", "Email", 200);
    const problem = emailProblem(rawEmail);
    if (problem) throw new ActionError(problem);
    const email = rawEmail.toLowerCase();
    const role = str(fd, "role", 40) as Role;
    if (!ROLES.includes(role as (typeof ROLES)[number])) throw new ActionError("Choose a role.");

    const { data } = check(
      await supabase
        .from("admins")
        .insert({ name, email, role, permissions: readPermissions(fd), mfa_required: fd.get("mfa_required") === "on" })
        .select("id")
        .single(),
      "add the person",
    );
    createdId = (data as { id: string }).id;
    // The sign-in account; the database links it to the team record by email.
    const { error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name } });
    if (error && !/already been registered/i.test(error.message)) {
      await supabase.from("admins").delete().eq("id", createdId);
      throw new ActionError(`Couldn't create the account: ${error.message}`);
    }
    link = await setupLink(email);
    emailed = await emailLink(email, name, link, access.name || access.email, true);
    return { ok: true, message: emailed ? `Invitation emailed to ${email}` : "Added. Email isn't set up yet, so send them the link below." };
  });
  if (result.ok && emailed && createdId) redirect(`/admin/team/${createdId}?invited=1`);
  return { ...result, link: result.ok && !emailed ? link : undefined };
}

export async function updateMember(id: string, _: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("super");
    const role = str(fd, "role", 40) as Role;
    const { data: current } = await supabase.from("admins").select("role").eq("id", id).maybeSingle();
    if (!current) throw new ActionError("That person is no longer on the team.");
    const isSuper = current.role === "super_admin";
    const update = isSuper
      ? { name: required(fd, "name", "Name", 120) }
      : {
          name: required(fd, "name", "Name", 120),
          role: ROLES.includes(role as (typeof ROLES)[number]) ? role : undefined,
          permissions: readPermissions(fd),
          mfa_required: fd.get("mfa_required") === "on",
          active: fd.get("active") === "on",
        };
    check(await supabase.from("admins").update(update).eq("id", id));
    return { ok: true, message: "Saved" };
  });
}

async function memberUser(id: string) {
  const { supabase } = await requireAction("super");
  const { data } = await supabase.from("admins").select("user_id, email, name, role").eq("id", id).maybeSingle();
  if (!data) throw new ActionError("That person is no longer on the team.");
  return { supabase, member: data as { user_id: string | null; email: string; name: string; role: Role } };
}

/** For a lost phone: removes their authenticator so they set it up again at next sign-in. */
export async function resetAuthenticator(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase, member } = await memberUser(id);
    if (!member.user_id) throw new ActionError("They haven't signed in yet.");
    const db = needService();
    const { data, error } = await db.auth.admin.mfa.listFactors({ userId: member.user_id });
    if (error) throw new ActionError(error.message);
    for (const f of data?.factors ?? []) await db.auth.admin.mfa.deleteFactor({ userId: member.user_id, id: f.id });
    const { data: me } = await supabase.auth.getClaims();
    await supabase.from("activity_log").insert({ actor: me?.claims.sub, actor_email: me?.claims.email, action: "reset authenticator", entity: "admins", entity_id: id, summary: member.email });
    return { ok: true, message: "Authenticator removed. They'll set it up again when they next sign in." };
  });
}

export async function sendPasswordLink(id: string): Promise<ActionResult & { link?: string }> {
  let link: string | undefined;
  let emailed = false;
  const result = await run(async () => {
    const { member } = await memberUser(id);
    const { access } = await requireAction("super");
    link = await setupLink(member.email);
    emailed = await emailLink(member.email, member.name, link, access.name, false);
    return { ok: true, message: emailed ? `Password link emailed to ${member.email}` : "Email isn't set up yet, so send them this link." };
  });
  return { ...result, link: result.ok && !emailed ? link : undefined };
}

export async function removeMember(id: string): Promise<ActionResult> {
  const result = await run(async () => {
    const { supabase, member } = await memberUser(id);
    if (member.role === "super_admin") throw new ActionError("The super admin can't be removed.");
    check(await supabase.from("admins").delete().eq("id", id), "remove");
    const db = serviceClient();
    // Deleting the sign-in account ends their sessions; their team record is already gone,
    // so the database refuses them even before their last token expires.
    if (db && member.user_id) await db.auth.admin.deleteUser(member.user_id);
  });
  if (result.ok) redirect("/admin/team");
  return result;
}
