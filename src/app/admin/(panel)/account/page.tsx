import type { Metadata } from "next";
import { Card, PageHead, adminStyles as s } from "@/components/admin/ui";
import Link from "next/link";
import { isManager, requirePage, ROLE_LABELS } from "@/lib/admin/access";
import { AccountForms } from "./AccountForms";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { access, supabase } = await requirePage();
  const { data } = await supabase.auth.mfa.listFactors();
  const factors = (data?.totp ?? [])
    .filter((f) => f.status === "verified")
    .map((f) => ({ id: f.id, name: f.friendly_name ?? "Authenticator app", created: f.created_at }));
  return (
    <div className={s.page}>
      <PageHead title="Your account" lead="How you sign in to the admin." />
      <Card title="Signed in as">
        <div className={s.fields}>
          <dl className={s.dl}>
            <div>
              <dt>Name</dt>
              <dd>{access.name || "Not set"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{access.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{ROLE_LABELS[access.role]}</dd>
            </div>
          </dl>
          {isManager(access) ? (
            <p className={`${s.small} ${s.muted}`}>
              Change your name in{" "}
              <Link href={`/admin/team/${access.id}`} className={s.textLink}>
                Team &amp; permissions
              </Link>
              .
            </p>
          ) : null}
        </div>
      </Card>
      <AccountForms factors={factors} mfaRequired={access.mfa_required} isSuper={access.role === "super_admin"} />
    </div>
  );
}
