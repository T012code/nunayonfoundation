import type { Metadata } from "next";
import { Card, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage, ROLE_LABELS } from "@/lib/admin/access";
import { AccountForms } from "./AccountForms";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { access, supabase } = await requirePage();
  const { data } = await supabase.auth.mfa.listFactors();
  const factors = (data?.totp ?? []).filter((f) => f.status === "verified").map((f) => ({ id: f.id, name: f.friendly_name ?? "Authenticator app", created: f.created_at }));
  return (
    <div className={s.page}>
      <PageHead title="Your account" lead={`${access.email} · ${ROLE_LABELS[access.role]}`} />
      <Card title="Signed in as">
        <p>{access.name || access.email}</p>
      </Card>
      <AccountForms factors={factors} mfaRequired={access.mfa_required} />
    </div>
  );
}
