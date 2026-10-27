"use client";

import { useActionState, useState, useTransition } from "react";
import { invite, removeMember, resetAuthenticator, sendPasswordLink, updateMember, type InviteResult } from "@/app/actions/admin/team";
import { SaveBar } from "@/components/admin/fields";
import { CopyLink } from "@/components/admin/CopyLink";
import { PERMISSION_LABELS, PERMISSIONS, ROLE_LABELS, ROLE_PRESETS, type Permission, type Role } from "@/lib/admin/permissions";
import styles from "@/components/admin/admin.module.css";

export type MemberValues = { id?: string; name: string; email: string; role: Role; permissions: Permission[]; mfa_required: boolean; active: boolean };

const ROLE_HELP: Record<Exclude<Role, "super_admin">, string> = {
  admin: "Everything except the team and email set-up. Up to 3 people.",
  editor: "Content: news, programmes, gallery and people.",
  communications: "Inbox, newsletter and news.",
};

export function MemberForm({ values, invited }: { values: MemberValues; invited?: boolean }) {
  const isNew = !values.id;
  const isSuper = values.role === "super_admin";
  const [state, action, pending] = useActionState<InviteResult | null, FormData>(
    isNew ? invite : (updateMember.bind(null, values.id!) as (s: InviteResult | null, fd: FormData) => Promise<InviteResult>),
    invited ? { ok: true, message: "Invitation emailed" } : null,
  );
  const [role, setRole] = useState<Role>(values.role);
  const [perms, setPerms] = useState<Permission[]>(values.permissions);
  const [busy, start] = useTransition();
  const [extra, setExtra] = useState<{ tone: "ok" | "error"; text: string; link?: string } | null>(null);
  const [confirm, setConfirm] = useState(false);

  const pickRole = (r: Role) => {
    setRole(r);
    if (r !== "super_admin") setPerms(ROLE_PRESETS[r]);
  };
  const toggle = (p: Permission) => setPerms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]));
  const runExtra = (fn: () => Promise<{ ok: boolean; message?: string; error?: string; link?: string }>) =>
    start(async () => {
      const r = await fn();
      setExtra({ tone: r.ok ? "ok" : "error", text: (r.ok ? r.message : r.error) ?? "", link: r.link });
    });

  return (
    <form action={action} className={styles.form}>
      <section className={styles.card}>
        <div className={styles.fields}>
          <div className={styles.row2}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input className={styles.input} name="name" defaultValue={values.name} maxLength={120} required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input className={styles.input} name="email" type="email" defaultValue={values.email} required readOnly={!isNew} />
              {!isNew ? <span className={styles.help}>To change someone&apos;s email, remove them and invite the new address.</span> : null}
            </label>
          </div>
        </div>
      </section>

      {isSuper ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Super admin</h2>
          <p className={styles.cardLead}>Has every permission, manages the team and email set-up, and always signs in with an authenticator app.</p>
        </section>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Role</h2>
            <div className={styles.checks} role="radiogroup" aria-label="Role">
              {(["admin", "editor", "communications"] as const).map((r) => (
                <label key={r} className={styles.check}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => pickRole(r)} />
                  <span className={styles.checkText}>
                    <strong>{ROLE_LABELS[r]}</strong>
                    <span className={styles.help}>{ROLE_HELP[r]}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Permissions</h2>
            <p className={styles.cardLead}>Choosing a role ticks its usual permissions. Adjust them for this person here.</p>
            <div className={styles.permGrid}>
              {PERMISSIONS.map((p) => (
                <label key={p} className={styles.check}>
                  <input type="checkbox" name="permissions" value={p} checked={perms.includes(p)} onChange={() => toggle(p)} />
                  <span className={styles.checkText}>
                    <strong>{PERMISSION_LABELS[p].label}</strong>
                    <span className={styles.help}>{PERMISSION_LABELS[p].help}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Security</h2>
            <div className={styles.checks}>
              <label className={styles.check}>
                <input type="checkbox" name="mfa_required" defaultChecked={values.mfa_required} />
                <span className={styles.checkText}>
                  <strong>Require an authenticator app</strong>
                  <span className={styles.help}>They&apos;ll set one up at their next sign-in and need a code every time.</span>
                </span>
              </label>
              {!isNew ? (
                <label className={styles.check}>
                  <input type="checkbox" name="active" defaultChecked={values.active} />
                  <span className={styles.checkText}>
                    <strong>Can sign in</strong>
                    <span className={styles.help}>Untick to pause their access without removing them.</span>
                  </span>
                </label>
              ) : null}
            </div>
          </section>
        </>
      )}

      {!isNew ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Sign-in help</h2>
          <div className={styles.fields}>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => runExtra(() => sendPasswordLink(values.id!))}>
                Send a password link
              </button>
              <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => runExtra(() => resetAuthenticator(values.id!))}>
                Reset authenticator app
              </button>
              {!isSuper ? (
                confirm ? (
                  <>
                    <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => runExtra(() => removeMember(values.id!))}>
                      Yes, remove {values.name.split(" ")[0] || "them"}
                    </button>
                    <button type="button" className={styles.ghostButton} onClick={() => setConfirm(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.ghostButton} onClick={() => setConfirm(true)}>
                    Remove from team
                  </button>
                )
              ) : null}
            </div>
            {extra ? (
              <p className={styles.status} data-tone={extra.tone} role="status">
                {extra.text}
              </p>
            ) : null}
            {extra?.link ? <CopyLink link={extra.link} /> : null}
          </div>
        </section>
      ) : null}

      {state && "link" in state && state.link ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Their set-up link</h2>
          <p className={styles.cardLead}>Send this to them privately (WhatsApp works). It signs them in once so they can choose a password.</p>
          <CopyLink link={state.link} />
        </section>
      ) : null}

      <SaveBar pending={pending} state={state} label={isNew ? "Send invitation" : "Save changes"} />
    </form>
  );
}
