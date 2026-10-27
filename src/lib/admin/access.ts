import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

import { PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS, ROLE_PRESETS, type Permission, type Role } from "./permissions";

export { PERMISSIONS, PERMISSION_LABELS, ROLE_LABELS, ROLE_PRESETS, type Permission, type Role };

export type Access = {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  mfa_required: boolean;
  aal: "aal1" | "aal2";
};

type State =
  | { state: "signed-out" }
  | { state: "no-access"; email: string }
  | { state: "needs-mfa"; access: Access; enrolled: boolean }
  | { state: "ok"; access: Access };

/**
 * Who is signed in and what they may do, checked against the database once per request.
 * MFA is asked for when the account requires it, or when the person has set it up anyway.
 */
export const getAccess = cache(async (): Promise<State> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { state: "signed-out" };
  const { data: row } = await supabase.rpc("my_access");
  const access = row as Access | null;
  if (!access) return { state: "no-access", email: String(data.claims.email ?? "") };
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const enrolled = aal?.nextLevel === "aal2";
  if (aal?.currentLevel !== "aal2" && (access.mfa_required || enrolled)) {
    return { state: "needs-mfa", access, enrolled };
  }
  return { state: "ok", access };
});

/** Super admin and admins: every permission, plus the team and email set-up. */
export const isManager = (a: Access) => a.role === "super_admin" || a.role === "admin";

export const can = (a: Access, perm: Permission) => isManager(a) || a.permissions.includes(perm);

type Level = Permission | "super" | "manage";

const allowed = (a: Access, perm?: Level) =>
  !perm || (perm === "super" ? a.role === "super_admin" : perm === "manage" ? isManager(a) : can(a, perm));

/** For admin pages: sends people to sign in, verify MFA, or back to the dashboard as needed. */
export async function requirePage(perm?: Level) {
  const s = await getAccess();
  if (s.state === "signed-out") redirect("/admin/login");
  if (s.state === "no-access") redirect("/admin/login?error=no-access");
  if (s.state === "needs-mfa") redirect("/admin/mfa");
  if (!allowed(s.access, perm)) redirect("/admin?denied=1");
  return { access: s.access, supabase: await createClient() };
}

export class ActionError extends Error {}

/** For admin server actions: the same checks, as an error the form can show. */
export async function requireAction(perm?: Level) {
  const s = await getAccess();
  if (s.state !== "ok") throw new ActionError("Your session has ended. Sign in again to continue.");
  if (!allowed(s.access, perm)) throw new ActionError("You don't have permission to do that.");
  return { access: s.access, supabase: await createClient() };
}
