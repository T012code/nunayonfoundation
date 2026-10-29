"use server";

import { redirect } from "next/navigation";
import { ActionError, PERMISSIONS, requireAction, type Permission, type Role } from "@/lib/admin/access";
import { required, str } from "@/lib/admin/form";
import { check, run, type ActionResult } from "@/lib/admin/result";
import { sendTemplate } from "@/lib/mail";
import { SITE_URL } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/server";
import { emailProblem } from "@/lib/validate";

const ROLES: Exclude<Role, "super_admin">[] = ["admin", "editor", "communications"];

function readPermissions(fd: FormData) {
  return fd.getAll("permissions").map(String).filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p));
}

/** Admins hold everything and always use an authenticator app; other roles take what's ticked. */
function accessFor(role: Role, fd: FormData) {
  return role === "admin"
    ? { permissions: [...PERMISSIONS], mfa_required: true }
    : { permissions: readPermissions(fd), mfa_required: fd.get("mfa_required") === "on" };
}

/** The database's own messages for the limits, in the form's words. */
function friendly(message: string) {
  if (/at most 3/i.test(message)) return "That role already has 3 people. Change someone else's role or remove them first.";
  if (/super admin/i.test(message)) return "The super admin's access can't be changed.";
  return message;
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

async function emailLink(email: string, name: string, link: string, by: string, isInvite: boolean) {
  const first = name.split(" ")[0] || "there";
  return isInvite
    ? sendTemplate("invite", email, { name: first, invited_by: by || "The team" }, { link })
    : sendTemplate("password_link", email, { name: first, sent_by: by || "The team" }, { link });
}

export type InviteResult = ActionResult & { link?: string };

export async function invite(_: unknown, fd: FormData): Promise<InviteResult> {
  let link: string | undefined;
  let emailed = false;
  let createdId: string | null = null;
  const result = await run(async () => {
    const { supabase, access } = await requireAction("manage");
    const db = needService();
    const name = required(fd, "name", "Name", 120);
    const rawEmail = required(fd, "email", "Email", 200);
    const problem = emailProblem(rawEmail);
    if (problem) throw new ActionError(problem);
    const email = rawEmail.toLowerCase();
    const role = str(fd, "role", 40) as Role;
    if (!ROLES.includes(role as (typeof ROLES)[number])) throw new ActionError("Choose a role.");

    const inserted = await supabase
      .from("admins")
      .insert({ name, email, role, ...accessFor(role, fd) })
      .select("id")
      .single();
    if (inserted.error) throw new ActionError(friendly(inserted.error.message));
    const { data } = inserted;
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
    const { supabase, access } = await requireAction("manage");
    const role = str(fd, "role", 40) as Role;
    const { data: current } = await supabase.from("admins").select("role").eq("id", id).maybeSingle();
    if (!current) throw new ActionError("That person is no longer on the team.");
    const isSuper = current.role === "super_admin";
    // Nobody but the super admin touches the super admin's record, and even then only the name.
    if (isSuper && access.role !== "super_admin") throw new ActionError("The super admin's details can only be changed by the super admin.");
    const nextRole = ROLES.includes(role as (typeof ROLES)[number]) ? role : (current.role as Role);
    const update = isSuper
      ? { name: required(fd, "name", "Name", 120) }
      : {
          name: required(fd, "name", "Name", 120),
          role: nextRole,
          ...accessFor(nextRole, fd),
          active: fd.get("active") === "on",
        };
    const { error } = await supabase.from("admins").update(update).eq("id", id);
    if (error) throw new ActionError(friendly(error.message));
    return { ok: true, message: "Saved" };
  });
}

/** The team member to act on. Sign-in help for the super admin's own account (a password link
 *  or a reset authenticator could hand it to someone else) is for the super admin alone. */
async function memberUser(id: string) {
  const { supabase, access } = await requireAction("manage");
  const { data } = await supabase.from("admins").select("user_id, email, name, role").eq("id", id).maybeSingle();
  if (!data) throw new ActionError("That person is no longer on the team.");
  const member = data as { user_id: string | null; email: string; name: string; role: Role };
  if (member.role === "super_admin" && access.role !== "super_admin") throw new ActionError("Only the super admin can do this for their own account.");
  return { supabase, access, member };
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
    const { member, access } = await memberUser(id);
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
