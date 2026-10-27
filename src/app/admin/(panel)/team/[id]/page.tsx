import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage, ROLE_PRESETS } from "@/lib/admin/access";
import { MemberForm, type MemberValues } from "../MemberForm";

export const metadata: Metadata = { title: "Team member" };

export default async function MemberAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ invited?: string }> }) {
  const [{ id }, { invited }] = await Promise.all([params, searchParams]);
  const { supabase } = await requirePage("super");
  let values: MemberValues = { name: "", email: "", role: "editor", permissions: ROLE_PRESETS.editor, mfa_required: false, active: true };
  if (id !== "new") {
    const { data } = await supabase.from("admins").select("id, name, email, role, permissions, mfa_required, active").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = data as MemberValues;
  }
  return (
    <div className={s.page}>
      <PageHead
        back={{ href: "/admin/team", label: "Team & permissions" }}
        title={id === "new" ? "Invite someone" : values.name || values.email}
        lead={id === "new" ? "They'll get an email with a link to choose a password." : undefined}
      />
      <MemberForm values={values} invited={!!invited} />
    </div>
  );
}
