import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/Icon";
import { Badge, formatTime, Notice, PageHead, adminStyles as s } from "@/components/admin/ui";
import { PERMISSION_LABELS, requirePage, ROLE_LABELS, type Permission, type Role } from "@/lib/admin/access";
import { serviceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Team & permissions" };

type Member = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  mfa_required: boolean;
  active: boolean;
};

export default async function TeamAdmin() {
  const { supabase } = await requirePage("manage");
  const { data } = await supabase
    .from("admins")
    .select("id, user_id, name, email, role, permissions, mfa_required, active")
    .order("created_at");
  const members = (data ?? []) as Member[];

  // Sign-in details (last sign-in, authenticator set up) come from the auth service.
  const db = serviceClient();
  const auth = new Map<string, { last: string | null; mfa: boolean }>();
  if (db) {
    const { data: users } = await db.auth.admin.listUsers({ perPage: 200 });
    for (const u of users?.users ?? []) {
      auth.set(u.id, { last: u.last_sign_in_at ?? null, mfa: (u.factors ?? []).some((f) => f.status === "verified") });
    }
  }
  const used = (r: Role) => members.filter((m) => m.role === r && m.active).length;

  return (
    <div className={s.page}>
      <PageHead
        title="Team & permissions"
        lead="Who can sign in to the admin and what each person can do. Admins can do everything; for editors and communications, the role ticks the usual permissions and you can adjust them per person. Nobody can change or remove the super admin."
        actions={
          <Link href="/admin/team/new" className={s.primaryButton}>
            <Icon name="plus" /> Invite someone
          </Link>
        }
      />
      {!db ? <Notice>Add SUPABASE_SECRET_KEY in Vercel to invite people and see sign-in details.</Notice> : null}
      <ul className={s.places} aria-label="Places used">
        {(["admin", "editor", "communications"] as const).map((r) => (
          <li key={r} data-full={used(r) >= 3 || undefined}>
            <strong>{{ admin: "Admins", editor: "Editors", communications: "Communications" }[r]}</strong> {used(r)} of
            3
          </li>
        ))}
      </ul>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col">Role</th>
              <th scope="col">Can manage</th>
              <th scope="col">Authenticator</th>
              <th scope="col">Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const a = m.user_id ? auth.get(m.user_id) : undefined;
              const perms =
                m.role === "super_admin" || m.role === "admin"
                  ? "Everything"
                  : m.permissions.map((p) => PERMISSION_LABELS[p].label).join(", ") || "Nothing yet";
              return (
                <tr key={m.id}>
                  <td>
                    <Link href={`/admin/team/${m.id}`} className={s.rowLink}>
                      {m.name || m.email}
                    </Link>
                    <div className={`${s.small} ${s.muted}`}>{m.email}</div>
                  </td>
                  <td>
                    <Badge tone={m.role === "super_admin" ? "teal" : undefined}>{ROLE_LABELS[m.role]}</Badge>{" "}
                    {!m.active ? <Badge tone="red">Off</Badge> : null}
                  </td>
                  <td className={`${s.small} ${s.muted}`}>{perms}</td>
                  <td className={s.small}>
                    {a?.mfa ? (
                      <Badge tone="green">Set up</Badge>
                    ) : m.mfa_required ? (
                      <Badge tone="amber">Required</Badge>
                    ) : (
                      <span className={s.muted}>Optional</span>
                    )}
                  </td>
                  <td className={`${s.small} ${s.muted} ${s.nowrap}`}>
                    {a?.last ? formatTime(a.last) : m.user_id ? "Never" : "Not set up"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
