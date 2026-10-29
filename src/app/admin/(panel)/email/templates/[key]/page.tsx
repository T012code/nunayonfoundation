import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Notice, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { EMAILS, isTemplateKey, mergeTemplate, type TemplateFields } from "@/lib/email-templates";
import { TemplateEditor } from "./TemplateEditor";

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  return { title: isTemplateKey(key) ? EMAILS[key].label : "Email" };
}

export default async function EditTemplate({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isTemplateKey(key)) notFound();
  const { supabase, access } = await requirePage("manage");
  const [{ data }, { data: mail }] = await Promise.all([
    supabase.from("email_templates").select("*").eq("key", key).maybeSingle<TemplateFields & { enabled: boolean }>(),
    supabase.from("mail_settings").select("has_password").maybeSingle<{ has_password: boolean }>(),
  ]);
  const def = EMAILS[key];
  return (
    <div className={s.page}>
      <PageHead title={def.label} lead={def.when} back={{ href: "/admin/email/templates", label: "All emails" }} />
      {!mail?.has_password ? (
        <Notice>
          No mailbox is connected yet, so this email isn&apos;t being sent.
          {key === "password_reset" ? " Until one is, password resets use Supabase's own plain email." : ""} Connect one under Email → Set-up.
        </Notice>
      ) : null}
      <TemplateEditor templateKey={key} value={mergeTemplate(key, data)} enabled={data?.enabled ?? true} edited={!!data} me={access.email} />
    </div>
  );
}
