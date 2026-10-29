import type { Metadata } from "next";
import { Notice, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import type { MailSettings } from "@/lib/mail";
import { serviceClient } from "@/lib/supabase/server";
import { EmailForm } from "./EmailForm";
import { EmailTabs } from "./EmailTabs";

export const metadata: Metadata = { title: "Email set-up" };

export default async function EmailAdmin() {
  const { supabase, access } = await requirePage("manage");
  const { data } = await supabase.from("mail_settings").select("*").maybeSingle();
  return (
    <div className={s.page}>
      <PageHead
        title="Email"
        lead="The mailbox the site sends from: form alerts, replies to visitors, team invitations, newsletter confirmations and newsletters."
      />
      <EmailTabs current="/admin/email" />
      {!serviceClient() ? <Notice>Add SUPABASE_SECRET_KEY in Vercel too: the server needs it to read these settings when sending.</Notice> : null}
      <EmailForm values={data as MailSettings} me={access.email} />
    </div>
  );
}
